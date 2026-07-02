# 翌月資金移動プランナー (payment-planner)

翌月の支払い予定を Google Apps Script (GAS) のWebアプリから取得し、
振替元口座ごとに「いくら資金移動が必要か」を集計表示する家計用Webアプリです。
[Flet](https://flet.dev/) 製で、Render に Docker としてデプロイして使います。

## 仕組み

```
スプレッドシート → GAS Webアプリ(JSON API) → このアプリ(Flet) → ブラウザ表示
```

GAS 側は次の形式の JSON 配列を返すようにデプロイしておきます。

```json
[
  {"振替元口座": "○○銀行", "日付": 27, "支払い先": "カード", "金額": 50000}
]
```

## 環境変数

| 変数 | 必須 | 説明 |
|---|---|---|
| `GAS_URL` | ✔ | GAS WebアプリのURL（`https://script.google.com/macros/s/.../exec`） |
| `PORT` | — | 待ち受けポート（既定 8080。Renderが自動設定） |

## ローカル実行

```bash
pip install -r requirements.txt
GAS_URL=<GASのURL> python payment_planner.py
# → http://localhost:8080 が開く
```

## Docker / Render デプロイ

```bash
docker build -t payment-planner .
docker run -e GAS_URL=<GASのURL> -p 8080:8080 payment-planner
```

Render では「Web Service（Docker）」としてこのリポジトリを接続し、
環境変数 `GAS_URL` を設定するだけでデプロイできます。

## 開発メモ

- 依存パッケージは flet の破壊的変更対策としてバージョン固定しています。
  上げる場合は必ずローカルで起動確認をしてください。
- Claude Code 向けのプロジェクト知識は `CLAUDE.md` にあります。
