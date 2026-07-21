import flet as ft
import json
import os
import time

# ── 投資ポートフォリオ一覧（銀行・証券） ──────────────────────────
# 銀行や証券会社の保有資産を手入力すると、合計・カテゴリ別合計・構成比が
# その場で（リアルタイムに）再計算されて画面に反映されるFletアプリ。
#
# データは外部に送らず、ブラウザのローカルストレージ（client_storage）に
# 保存する。リロードしてもデータは残る。外部API接続やAPIキーは不要。
# ──────────────────────────────────────────────────────────────

STORAGE_KEY = "investment_tracker.holdings.v1"

# 種別の定義（表示ラベルと色をまとめて持つ）
KIND_BANK = "銀行"
KIND_SECURITIES = "証券"
KIND_META = {
    KIND_BANK: {"color": ft.Colors.BLUE_600, "bg": ft.Colors.BLUE_50, "icon": ft.Icons.ACCOUNT_BALANCE},
    KIND_SECURITIES: {"color": ft.Colors.GREEN_700, "bg": ft.Colors.GREEN_50, "icon": ft.Icons.SHOW_CHART},
}


def yen(v):
    """金額を ¥1,234 形式に整形する。"""
    try:
        return f"¥{int(round(v)):,}"
    except (TypeError, ValueError):
        return "¥0"


def main(page: ft.Page):
    page.title = "投資ポートフォリオ一覧"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 20
    page.scroll = ft.ScrollMode.ADAPTIVE

    # ── データの読み書き ─────────────────────────────────────────
    # holdings は次の形の dict のリスト:
    #   {"id": str, "kind": "銀行"/"証券", "institution": str, "name": str, "amount": int}
    holdings = []

    def load():
        nonlocal holdings
        raw = page.client_storage.get(STORAGE_KEY)
        if raw:
            try:
                holdings = json.loads(raw) if isinstance(raw, str) else list(raw)
            except (ValueError, TypeError):
                holdings = []
        else:
            holdings = []

    def save():
        # JSON文字列として保存（client_storageのバックエンド差異を避ける）
        page.client_storage.set(STORAGE_KEY, json.dumps(holdings, ensure_ascii=False))

    def new_id():
        return f"{int(time.time() * 1000)}-{len(holdings)}"

    # ── 入力フォーム ─────────────────────────────────────────────
    kind_field = ft.Dropdown(
        label="種別",
        value=KIND_BANK,
        width=120,
        options=[ft.dropdown.Option(KIND_BANK), ft.dropdown.Option(KIND_SECURITIES)],
    )
    institution_field = ft.TextField(label="金融機関名", hint_text="例: 〇〇銀行 / 〇〇証券", width=200)
    name_field = ft.TextField(label="商品・口座名", hint_text="例: 普通預金 / 投資信託A", width=200)
    amount_field = ft.TextField(
        label="金額（円）",
        hint_text="例: 500000",
        width=140,
        keyboard_type=ft.KeyboardType.NUMBER,
        prefix_text="¥",
    )
    form_error = ft.Text("", color=ft.Colors.RED, size=12, visible=False)

    def show_form_error(msg):
        form_error.value = msg
        form_error.visible = True
        page.update()

    def clear_form_error():
        if form_error.visible:
            form_error.visible = False
            page.update()

    def add_item(e=None):
        institution = (institution_field.value or "").strip()
        name = (name_field.value or "").strip()
        amount_raw = (amount_field.value or "").strip().replace(",", "")

        if not institution:
            show_form_error("金融機関名を入力してください。")
            return
        if not name:
            show_form_error("商品・口座名を入力してください。")
            return
        try:
            amount = int(float(amount_raw))
        except ValueError:
            show_form_error("金額は数字で入力してください。")
            return
        if amount < 0:
            show_form_error("金額は0以上で入力してください。")
            return

        holdings.append({
            "id": new_id(),
            "kind": kind_field.value or KIND_BANK,
            "institution": institution,
            "name": name,
            "amount": amount,
        })
        save()

        # 入力欄をリセット（種別はそのまま＝連続入力しやすく）
        institution_field.value = ""
        name_field.value = ""
        amount_field.value = ""
        form_error.visible = False
        render()
        institution_field.focus()

    def delete_item(item_id):
        nonlocal holdings
        holdings = [h for h in holdings if h["id"] != item_id]
        save()
        render()

    def make_amount_change_handler(item_id):
        """一覧の各行の金額を直接編集したときに、その場で再計算する。"""
        def handler(e):
            raw = (e.control.value or "").strip().replace(",", "")
            try:
                val = int(float(raw)) if raw else 0
            except ValueError:
                return  # 数字以外は無視（サマリーは更新しない）
            for h in holdings:
                if h["id"] == item_id:
                    h["amount"] = max(0, val)
                    break
            save()
            update_summary()  # 合計・構成比だけ即時更新（一覧の再描画はしない）
        return handler

    # ── 表示エリア ───────────────────────────────────────────────
    summary_area = ft.Column(spacing=12)
    list_area = ft.Column(spacing=16)

    def totals():
        total = sum(h["amount"] for h in holdings)
        by_kind = {KIND_BANK: 0, KIND_SECURITIES: 0}
        for h in holdings:
            by_kind[h.get("kind", KIND_BANK)] = by_kind.get(h.get("kind", KIND_BANK), 0) + h["amount"]
        return total, by_kind

    def build_summary():
        total, by_kind = totals()
        controls = [
            ft.Container(
                content=ft.Row([
                    ft.Text("総資産評価額", size=18, weight=ft.FontWeight.BOLD),
                    ft.Text(yen(total), size=30, weight=ft.FontWeight.BOLD, color=ft.Colors.INDIGO_700),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                padding=20,
                border_radius=12,
                bgcolor=ft.Colors.INDIGO_50,
                border=ft.border.all(2, ft.Colors.INDIGO_200),
            )
        ]

        # 銀行 / 証券のカテゴリ別合計と構成比
        cat_row = []
        for kind in (KIND_BANK, KIND_SECURITIES):
            amount = by_kind.get(kind, 0)
            pct = (amount / total * 100) if total else 0
            meta = KIND_META[kind]
            cat_row.append(
                ft.Container(
                    expand=True,
                    content=ft.Column([
                        ft.Row([
                            ft.Icon(meta["icon"], color=meta["color"], size=18),
                            ft.Text(kind, weight=ft.FontWeight.BOLD, color=meta["color"]),
                        ], spacing=6),
                        ft.Text(yen(amount), size=22, weight=ft.FontWeight.BOLD),
                        ft.Text(f"構成比 {pct:.1f}%", size=12, color=ft.Colors.GREY_700),
                    ], spacing=4),
                    padding=16,
                    border_radius=10,
                    bgcolor=meta["bg"],
                    border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
                )
            )
        controls.append(ft.Row(cat_row, spacing=12))
        return controls

    def update_summary():
        """金額のインライン編集時に、サマリーだけを差し替えて即時反映する。"""
        summary_area.controls = build_summary()
        page.update()

    def build_list():
        if not holdings:
            return [
                ft.Container(
                    content=ft.Text(
                        "まだ登録がありません。上のフォームから銀行・証券の保有資産を追加してください。",
                        color=ft.Colors.GREY_600,
                    ),
                    padding=24,
                    alignment=ft.alignment.center,
                )
            ]

        total, _ = totals()
        controls = []
        # 種別 → 金融機関 の2段でグループ化して表示
        for kind in (KIND_BANK, KIND_SECURITIES):
            kind_items = [h for h in holdings if h.get("kind", KIND_BANK) == kind]
            if not kind_items:
                continue
            meta = KIND_META[kind]

            # 金融機関ごとにまとめる（登場順を維持）
            institutions = {}
            for h in kind_items:
                institutions.setdefault(h["institution"], []).append(h)

            kind_total = sum(h["amount"] for h in kind_items)
            controls.append(
                ft.Row([
                    ft.Icon(meta["icon"], color=meta["color"]),
                    ft.Text(kind, size=20, weight=ft.FontWeight.BOLD, color=meta["color"]),
                    ft.Text(yen(kind_total), size=16, weight=ft.FontWeight.W_500, color=ft.Colors.GREY_700),
                ], spacing=8)
            )

            for inst_name, items in institutions.items():
                inst_total = sum(h["amount"] for h in items)
                rows = [
                    ft.Row([
                        ft.Text(inst_name, size=17, weight=ft.FontWeight.BOLD),
                        ft.Text(yen(inst_total), size=16, weight=ft.FontWeight.BOLD, color=meta["color"]),
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                    ft.Divider(height=8),
                ]
                for h in items:
                    pct = (h["amount"] / total * 100) if total else 0
                    rows.append(
                        ft.Row([
                            ft.Column([
                                ft.Text(h["name"], size=14),
                                ft.Text(f"構成比 {pct:.1f}%", size=11, color=ft.Colors.GREY_600),
                            ], spacing=2, expand=True),
                            ft.TextField(
                                value=str(h["amount"]),
                                width=140,
                                height=44,
                                text_align=ft.TextAlign.RIGHT,
                                prefix_text="¥",
                                content_padding=ft.padding.symmetric(horizontal=8, vertical=6),
                                keyboard_type=ft.KeyboardType.NUMBER,
                                on_change=make_amount_change_handler(h["id"]),
                            ),
                            ft.IconButton(
                                icon=ft.Icons.DELETE_OUTLINE,
                                icon_color=ft.Colors.RED_400,
                                tooltip="削除",
                                on_click=lambda e, iid=h["id"]: delete_item(iid),
                            ),
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN, vertical_alignment=ft.CrossAxisAlignment.CENTER)
                    )

                controls.append(
                    ft.Container(
                        content=ft.Column(rows, spacing=6),
                        padding=16,
                        border_radius=10,
                        border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
                        bgcolor=ft.Colors.GREY_50,
                    )
                )
        return controls

    def render():
        summary_area.controls = build_summary()
        list_area.controls = build_list()
        page.update()

    # ── 画面の組み立て ───────────────────────────────────────────
    add_button = ft.Container(
        content=ft.Row([
            ft.Icon(ft.Icons.ADD, color=ft.Colors.WHITE, size=18),
            ft.Text("追加", color=ft.Colors.WHITE, weight=ft.FontWeight.BOLD),
        ], spacing=4, tight=True),
        bgcolor=ft.Colors.INDIGO_600,
        padding=ft.padding.symmetric(horizontal=20, vertical=14),
        border_radius=8,
        ink=True,
        on_click=add_item,
    )

    form_card = ft.Container(
        content=ft.Column([
            ft.Text("保有資産を追加", size=16, weight=ft.FontWeight.BOLD),
            ft.Row(
                [kind_field, institution_field, name_field, amount_field, add_button],
                wrap=True,
                spacing=12,
                run_spacing=12,
                vertical_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            form_error,
        ], spacing=10),
        padding=20,
        border_radius=12,
        bgcolor=ft.Colors.WHITE,
        border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
    )

    # 入力中にエラー表示が出っぱなしにならないよう、変更で消す
    for f in (kind_field, institution_field, name_field, amount_field):
        f.on_change = lambda e: clear_form_error()
    # Enterキーでも追加できるように
    amount_field.on_submit = add_item

    page.add(
        ft.Row([
            ft.Text("投資ポートフォリオ一覧", size=24, weight=ft.FontWeight.BOLD),
        ]),
        ft.Text(
            "銀行・証券の保有資産を入力すると、合計と構成比がその場で更新されます。"
            "データはこの端末のブラウザ内にのみ保存されます。",
            color=ft.Colors.GREY_700,
            size=13,
        ),
        ft.Divider(height=10),
        summary_area,
        ft.Container(height=4),
        form_card,
        ft.Container(height=4),
        list_area,
    )

    load()
    render()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    ft.app(target=main, view=ft.AppView.WEB_BROWSER, host="0.0.0.0", port=port)
