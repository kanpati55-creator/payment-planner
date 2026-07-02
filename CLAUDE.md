# payment-planner — 翌月資金移動プランナー

Flet製のWebアプリ。Google Apps Script (GAS) のWebアプリから翌月の支払い予定(JSON)を取得し、
振替元口座ごとに集計・表示する家計ツール。Render に Docker でデプロイして運用。

## 構成
- `payment_planner.py` — アプリ本体（1ファイル完結）
- GASが返すJSON形式: `[{"振替元口座": str, "日付": int, "支払い先": str, "金額": int|str}, ...]`
- 環境変数: `GAS_URL`（必須・GAS WebアプリのURL）、`PORT`（既定 8080）

## 実行
```
pip install -r requirements.txt
GAS_URL=<GASのURL> python payment_planner.py   # → http://localhost:8080
```

## 注意（ハマりどころ）
- flet は破壊的変更が多いため requirements.txt でバージョン固定済み。更新時は必ず起動確認する。
- flet 0.80以降 `ft.app()` は非推奨（0.85では動作する）。置き換えるなら `ft.run(main)`。
- Web実行には `flet-web` が必要。requirements に含めてある（無いと起動時にダウンロードが走る）。

## 規約
- コミットメッセージは日本語1行で「何をなぜ」（例: `GAS取得にタイムアウト10秒を追加`）
