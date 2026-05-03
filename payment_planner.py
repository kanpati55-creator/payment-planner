import flet as ft
import requests
import os

# 1. 接続先設定（Renderの環境変数から読み込む。なければ直書きを使う）
GAS_URL = os.getenv("GAS_URL", "https://script.google.com/macros/s/AKfycbxL_nxyq6VhGTbmCb0jt9FsVdwqovsvEpA_42okLHjQzFCmWrZisZ5_TMxviORQA8Yb/exec")

def main(page: ft.Page):
    page.title = "翌月資金移動プランナー"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 20
    # 画面全体のスクロールを有効にする
    page.scroll = ft.ScrollMode.ADAPTIVE
    
    # 状態管理用のコンテナ
    list_view = ft.Column(spacing=20, scroll=ft.ScrollMode.ADAPTIVE)

    def fetch_data(e=None):
        list_view.controls.clear()
        page.update()
        
        try:
            # GASからデータ取得
            response = requests.get(GAS_URL)
            data = response.json()
            
            grand_total = 0
            accounts = {}
            for item in data:
                acc = item["振替元口座"]
                if acc not in accounts:
                    accounts[acc] = {"total": 0, "details": []}
                val = int(item["金額"])
                accounts[acc]["total"] += val
                grand_total += val
                accounts[acc]["details"].append(item)
            
            # --- 1. 全体合計のカードを追加 ---
            list_view.controls.append(
                ft.Container(
                    content=ft.Row([
                        ft.Text("すべての口座の合計", size=18, weight=ft.FontWeight.BOLD),
                        ft.Text(f"¥{grand_total:,}", size=28, weight=ft.FontWeight.BOLD, color=ft.Colors.RED_600)
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                    padding=20,
                    border_radius=12,
                    bgcolor=ft.Colors.ORANGE_50,
                    border=ft.border.all(2, ft.Colors.ORANGE_200)
                )
            )
            
            # --- 2. 各口座ごとの内訳を表示 ---
            for acc_name, info in accounts.items():
                list_view.controls.append(
                    ft.Container(
                        content=ft.Column([
                            ft.Text(acc_name, size=18, weight=ft.FontWeight.BOLD),
                            ft.Divider(),
                            *[ft.Row([
                                ft.Text(f"{d['日付']}日: {d['支払い先']}"),
                                ft.Text(f"¥{int(d['金額']):,}", weight=ft.FontWeight.W_500)
                            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN) for d in info["details"]],
                            ft.Divider(),
                            ft.Row([
                                ft.Text("この口座の合計", color=ft.Colors.BLUE_700),
                                ft.Text(f"¥{info['total']:,}", size=20, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_700)
                            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
                        ]),
                        padding=20,
                        border_radius=10,
                        border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
                        bgcolor=ft.Colors.GREY_50
                    )
                )
        except Exception as ex:
            list_view.controls.append(ft.Text(f"エラーが発生しました: {ex}", color=ft.Colors.RED))
        
        page.update()

    # UI構成
    page.add(
        ft.Row([
            ft.Text("来月の支払い予定", size=24, weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Text("更新", color=ft.Colors.WHITE, weight=ft.FontWeight.BOLD),
                bgcolor=ft.Colors.BLUE_700,
                padding=ft.padding.symmetric(horizontal=20, vertical=10),
                border_radius=8,
                ink=True,
                on_click=fetch_data
            )
        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
        ft.Text("※月末に確認し、必要な資金移動を行ってください", color=ft.Colors.GREY_700),
        ft.Divider(height=10),
        list_view
    )

    fetch_data()

if __name__ == "__main__":
    # Web公開用にポート番号を環境変数から取得するように設定
    port = int(os.getenv("PORT", 8080))
    ft.app(target=main, view=None, port=port)