# 🎸 ギターの相棒 — アコギ用チューナー & コード検索アプリ

ブラウザだけで動く、アコースティックギターのためのアプリです。
インストール不要・`index.html` を開くだけで使えます。スマホでも PC でも OK。

## 機能

### 🎤 チューナー
- マイクで弦の音を拾って音程を自動判定（自己相関方式、±0.5セント精度）
- 針のゲージで「低い／ぴったり／高い」を表示し、ペグを巻く方向を日本語でガイド
- いま鳴らしている音に一番近い弦を自動でハイライト
- 6弦それぞれの基準音（E2 A2 D3 G3 B3 E4）を再生できる

### 🎵 コード検索
- ルート音（C〜B の12音）× コードタイプ 19種類 = **228コード**に対応
  - メジャー / m / 7 / m7 / maj7 / 6 / m6 / sus4 / sus2 / 7sus4 / add9 / 9 / m9 / mM7 / dim / dim7 / m7♭5 / aug / パワーコード
- オープンコードとセーハ（バレー）コードの押さえ方をダイアグラム表示
- 「♪ 鳴らす」ボタンで実際の響きを再生して耳でも確認できる
- 構成音の表示付き

## 使い方

### いちばん簡単な方法（GitHub Pages で公開する）
1. GitHub のリポジトリページで **Settings → Pages** を開く
2. 「Source」で **Deploy from a branch** を選び、このブランチと `/ (root)` を指定して Save
3. 表示された URL をスマホや PC で開く

※ チューナーのマイク機能は **https のページ**（GitHub Pages なら OK）または
`localhost` でしか動きません（ブラウザのセキュリティ仕様です）。

### ローカルで試す場合
```bash
# リポジトリのフォルダで
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

コード検索だけなら `index.html` をダブルクリックで開くだけでも動きます。

## 💰 翌月資金移動プランナー（payment_planner.py）

Google Apps Script (GAS) のWebアプリから支払い予定を取得して表示するFletアプリです。

### セットアップ
GASのWebアプリURLは**環境変数 `GAS_URL`** で渡します。コードには書きません。

```bash
# ローカルで実行する場合
export GAS_URL="https://script.google.com/macros/s/（自分のデプロイID）/exec"
python3 payment_planner.py
```

Renderにデプロイする場合は、ダッシュボードの **Environment → Environment Variables** に `GAS_URL` を追加してください。

### ⚠️ セキュリティ上の注意
- GASのWebアプリURLは**秘密情報として扱う**こと。URLを知っている人は誰でも支払いデータ（口座名・支払先・金額）を取得できます。
- URL・APIキー・トークンの類いは絶対にコードやREADMEに直接書かず、環境変数や `.env`（gitignore済み）を使うこと。
- もし誤ってコミット・pushしてしまった場合は、履歴から消すだけでは不十分です。**GAS側で該当デプロイをアーカイブして新しいURLで再デプロイ**（＝漏れたURLの無効化）を必ず行うこと。

## 📊 投資ポートフォリオ一覧（investment_tracker.py）

銀行・証券会社の保有資産を手入力すると、**合計・カテゴリ別合計・構成比がその場でリアルタイム更新**されるFletアプリです。

### 特徴
- 種別（銀行／証券）・金融機関名・商品/口座名・金額を入力して一覧に追加
- 総資産評価額、銀行合計・証券合計、各資産の構成比（%）を自動計算
- 一覧の金額欄はその場で編集でき、変更すると合計・構成比が即座に再計算される
- データは**この端末のブラウザ内（localStorage）にのみ保存**され、リロードしても残る
- 外部API接続・APIキー・ログイン一切不要

### 実行
```bash
python3 investment_tracker.py
# ブラウザで http://localhost:8080 が開く
```

Renderにデプロイする場合は起動コマンドを `python investment_tracker.py` にしてください
（`PORT` 環境変数は自動で使われます）。

### メモ
- 株価や基準価額を外部から自動取得する機能はありません（手入力の評価額を管理する用途）。
- データは端末ローカル保存のため、別の端末やブラウザには引き継がれません。

## 📱 投資一覧のiPhoneアプリ版（PWA / investments.html）

`investment_tracker.py` と同じ機能を、**サーバー不要の単一HTML（PWA）**で再現したものです。
iPhoneのホーム画面に追加すると、独自アイコンで全画面起動し、ネイティブアプリのように使えます。
オフラインでも起動でき、データはブラウザ内（localStorage）に保存されます。

関連ファイル：`investments.html` / `manifest.webmanifest` / `sw.js` / `icons/`

### iPhoneのホーム画面に追加する手順
1. まずHTTPSで公開する（下の「公開方法」参照）。※PWA機能はhttpsまたは`localhost`でのみ動作します。
2. iPhoneの **Safari** で公開URLの `.../investments.html` を開く
3. 下部の **共有ボタン（□に↑）** → **「ホーム画面に追加」** をタップ
4. ホーム画面に「投資一覧」アイコンが追加され、タップすると全画面のアプリとして起動

### 公開方法（GitHub Pages・無料・HTTPS）
1. GitHubリポジトリの **Settings → Pages** を開く
2. 「Source」で **Deploy from a branch** を選び、このブランチと `/ (root)` を指定して Save
3. 発行されたURLの末尾に `/investments.html` を付けてSafariで開く

### ローカルで試す場合
```bash
python3 -m http.server 8000
# 同じ端末なら http://localhost:8000/investments.html
# （Service Workerはlocalhostでも動作します）
```

### メモ
- Flet版（`investment_tracker.py`）とデータは共有されません（保存先が別）。
- アプリを更新したときは `sw.js` の `CACHE` 名（`invest-tracker-v1` の数字）を上げると、古いキャッシュが確実に更新されます。
- Safariのプライベートモードやデータ消去を行うと保存データは消えます。

## 技術メモ
- 依存ライブラリなしの単一 HTML ファイル（HTML + CSS + JavaScript）
- チューナー：Web Audio API + 自己相関（ACF2+）によるピッチ検出、放物線補間つき
- コード：オープンコード辞書 + E フォーム／A フォームの移動式セーハフォームから自動生成
- 音の再生：Web Audio API による撥弦シンセ（トライアングル波 + ローパスフィルタ減衰）
