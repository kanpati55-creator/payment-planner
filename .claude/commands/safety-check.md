---
description: payment_planner.py を構文チェックし、バグや例外処理の観点で点検する
allowed-tools: Bash(python3 -m py_compile:*), Bash(python3 -c:*)
---

## 構文チェック結果

!`python3 -m py_compile payment_planner.py && echo "✅ 構文OK（コンパイル成功）" || echo "❌ 構文エラーあり"`

## レビュー対象のソース

@payment_planner.py

## お願い

上の構文チェック結果と、参照したソースコードをもとに、
`payment_planner.py` を日本語で点検してください:

- 構文チェックが失敗していれば、その原因と直し方
- 実行時に落ちそうな箇所（`requests.get` の失敗、`response.json()`、
  `item["金額"]` の `int()` 変換など）
- 例外処理が足りていない箇所と、追加するとよい対策

最後に「致命的 / 改善推奨 / 任意」の3段階で優先度を付けてください。
