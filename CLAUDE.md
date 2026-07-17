# このリポジトリについて

個人開発ツール群と、それをビジネスに変換するための運用システムを管理するリポジトリ。

## 資産（プロダクト）

- `index.html` — ギターの相棒（アコギ用チューナー & 228コード検索）。依存なし単一HTML。
- `payment_planner.py` — 翌月資金移動プランナー（Flet + GAS連携）。`GAS_URL` は環境変数必須。

## ビジネス運用システム

`business/` 配下でアイデア→検証→公開→計測のサイクルを回す。
全体設計は `docs/business-system.md` を参照。

- `business/ideas.md` — アイデアバックログ。着手前のアイデアはすべてここに集約。
- `business/validation-log.md` — 検証ログ。試したこと・結果・学びを必ず記録。
- `business/weekly-review.md` — 週次レビューの記録。

## マルチエージェント体制

`.claude/agents/` に役割別のサブエージェントを定義している。
該当する作業を頼まれたら、対応するエージェントに委任すること。

| エージェント | 役割 |
|---|---|
| `market-researcher` | 市場・競合・需要の調査。アイデアの検証材料を集める |
| `product-builder` | プロダクトの実装・改修 |
| `quality-reviewer` | コード・セキュリティ・使いやすさのレビュー |
| `publisher` | 公開準備（README・LP・ストア文言・告知文の作成） |

## 作業ルール

- 新しいアイデアはいきなり作らず、まず `business/ideas.md` に追記し、
  `market-researcher` で15分調査してから着手判断する。
- 検証（公開・告知・計測）を伴う作業を終えたら `business/validation-log.md` に結果を記録する。
- 秘密情報（GAS_URL、APIキー等）はコードに書かない。環境変数を使う。
- コミットメッセージは日本語で簡潔に。
