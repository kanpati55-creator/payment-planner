const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  LevelFormat, PageOrientation, VerticalAlign, TabStopType, HeightRule,
} = require("docx");

const JP = { ascii: "Yu Gothic", eastAsia: "Yu Gothic", hAnsi: "Yu Gothic" };
const ACCENT = "1F4E79"; // 濃紺
const LIGHT = "DCE6F1";  // 薄青
const GREY = "F2F2F2";

const numbering = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "・",
        style: { paragraph: { indent: { left: 360, hanging: 240 } } },
      }],
    },
    {
      reference: "steps",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        style: { paragraph: { indent: { left: 400, hanging: 280 } } },
      }],
    },
  ],
};

function run(text, opts = {}) {
  return new TextRun({ text, font: JP, size: opts.size || 21, bold: !!opts.bold, color: opts.color, ...opts });
}
function p(text, opts = {}) {
  return new Paragraph({
    children: Array.isArray(text) ? text : [run(text, opts)],
    spacing: { after: opts.after ?? 80, before: opts.before ?? 0 },
    alignment: opts.align,
    numbering: opts.bullet ? { reference: "bullets", level: 0 } : opts.step ? { reference: "steps", level: 0 } : undefined,
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    border: opts.border,
  });
}
function heading(text, opts = {}) {
  return new Paragraph({
    children: [run(" " + text, { size: opts.size || 24, bold: true, color: "FFFFFF" })],
    spacing: { before: opts.before ?? 200, after: 100 },
    shading: { type: ShadingType.CLEAR, fill: ACCENT },
  });
}
function cell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: (Array.isArray(text) ? text : [text]).map(t =>
      typeof t === "string" ? p(t, { size: opts.size || 19, bold: opts.bold, after: 0 }) : t),
  });
}

// ---------- 1. 案内資料（A4・1枚） ----------
function flyer() {
  const W = 10460;
  const feeTable = new Table({
    columnWidths: [3200, 3200, 4060],
    rows: [
      new TableRow({ children: [
        cell("メニュー", 3200, { fill: LIGHT, bold: true }),
        cell("料金（税込）", 3200, { fill: LIGHT, bold: true }),
        cell("内容", 4060, { fill: LIGHT, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("現場業務の棚卸し診断", 3200, { bold: true }),
        cell("33,000円", 3200),
        cell("訪問ヒアリング90分＋改善マップ1枚＋自動化の概算見積り（1週間で納品）", 4060),
      ]}),
      new TableRow({ children: [
        cell("小型ツールの実装", 3200, { bold: true }),
        cell("5万〜30万円", 3200),
        cell("診断結果に基づき個別見積り。Excel自動化・日報のスマホ化・書類の自動作成など", 4060),
      ]}),
    ],
  });

  return {
    properties: { page: { margin: { top: 620, bottom: 620, left: 720, right: 720 } } },
    children: [
      p([run("建設・土木の中小企業向け", { size: 22, bold: true, color: ACCENT })], { align: AlignmentType.CENTER, after: 40 }),
      p([run("現場業務の棚卸し診断", { size: 44, bold: true })], { align: AlignmentType.CENTER, after: 60 }),
      p([run("紙とExcelの事務負担を、大がかりなシステムなしで軽くします", { size: 24, bold: true, color: ACCENT })], { align: AlignmentType.CENTER, after: 160 }),

      heading("こんなお困りごとはありませんか", { before: 60 }),
      p("日報・工程表・勤怠がいまだに紙やホワイトボード", { bullet: true }),
      p("元請ごとの指定Excel様式に、同じ内容を何度も転記している", { bullet: true }),
      p("社長や事務員さんが、毎日2時間以上を事務作業に取られている", { bullet: true }),
      p("施工管理アプリを入れてみたが、現場で定着しなかった", { bullet: true }),

      heading("この診断でやること"),
      p("90分の訪問ヒアリングで、受注から請求までの業務の流れと「時間を食っている作業」を棚卸しします", { step: true }),
      p("結果を「改善マップ」1枚にまとめ、効果の大きい順に打ち手と概算費用をご提示します（1週間で納品）", { step: true }),
      p("ご希望があれば、そのまま小さな自動化ツールの実装までお引き受けします", { step: true }),

      heading("選ばれる理由"),
      p([run("① 建設・土木ひと筋44年。", { size: 21, bold: true }), run("現場監督・設計・官庁営業・DX推進部署の責任者まで経験。現場の言葉で話せます", { size: 21 })], { bullet: true }),
      p([run("② 診断で終わらせません。", { size: 21, bold: true }), run("VBA・Python・AIを使った小型ツールを実装して納品するところまでが仕事です", { size: 21 })], { bullet: true }),
      p([run("③ 高額システムを売りません。", { size: 21, bold: true }), run("いまお使いのExcel様式・仕事の流れはそのままに、面倒な部分だけを自動化します", { size: 21 })], { bullet: true }),

      heading("料金"),
      feeTable,
      p([run("※ デジタル化・AI導入補助金など、補助金活用のご相談も承ります", { size: 18 })], { before: 60, after: 120 }),

      heading("ご相談の流れ"),
      p("お問い合わせ（電話・メール） → 日程調整 → 訪問ヒアリング90分 → 改善マップ納品 → （ご希望により）実装", { after: 140 }),

      new Table({
        columnWidths: [W],
        rows: [new TableRow({ children: [
          cell([
            p([run("お問い合わせ", { size: 22, bold: true, color: ACCENT })], { after: 40 }),
            p([run("【屋号・氏名】　　　　　　【電話】000-0000-0000　　　　　　【メール】example@example.com", { size: 21 })], { after: 0 }),
          ], W, { fill: GREY }),
        ]})],
      }),
    ],
  };
}

// ---------- 2. ヒアリングシート ----------
function hearingSheet() {
  const W = 9740;
  const blank = "";
  const grid = (headers, widths, rows) => new Table({
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, widths[i], { fill: LIGHT, bold: true })) }),
      ...Array.from({ length: rows }, () => new TableRow({
        height: { value: 520, rule: HeightRule.ATLEAST },
        children: widths.map(w => cell(blank, w)),
      })),
    ],
  });
  const qa = items => new Table({
    columnWidths: [3200, 6540],
    rows: items.map(q => new TableRow({ height: { value: 520, rule: HeightRule.ATLEAST }, children: [cell(q, 3200, { fill: GREY }), cell(blank, 6540)] })),
  });

  return {
    properties: { page: { margin: { top: 720, bottom: 720, left: 850, right: 850 } } },
    children: [
      p([run("現場業務の棚卸し診断　ヒアリングシート", { size: 32, bold: true })], { after: 40 }),
      p([run("診断日：　　　　年　　月　　日　　／　記入者：", { size: 20 })], { after: 160 }),

      heading("1. 会社の概要", { before: 0 }),
      qa(["会社名・所在地", "社員数（現場／事務）", "主な工種・工事内容", "元請・下請の比率", "主要な取引先（元請）"]),

      heading("2. 業務の流れ（受注から請求まで）"),
      p("各段階で「誰が・何を・どんな方法（紙／Excel／アプリ）で」やっているかを記入", { size: 18, after: 60 }),
      qa(["見積り・受注", "施工計画・工程管理", "日報・出面・勤怠", "写真・出来形管理", "安全書類・提出書類", "請求・支払い"]),

      heading("3. 紙・Excel作業の洗い出し"),
      grid(["作業の名前", "頻度", "1回の時間", "担当者", "いまの方法", "困りごと"], [1900, 1000, 1100, 1200, 1740, 2800], 6),

      heading("4. 特に時間を取られている作業　トップ3"),
      grid(["順位", "作業", "月あたりのおおよその時間", "こうなったら楽（理想）"], [700, 3040, 2400, 3600], 3),

      heading("5. 元請の指定様式・二重入力"),
      qa(["元請指定のExcel・紙様式", "同じ内容を2回以上入力している業務"]),

      heading("6. いまのIT環境"),
      qa(["PC・スマホ・タブレットの台数", "使用中のソフト・アプリ（会計・施工管理など）", "過去に導入してやめたもの・理由"]),

      heading("7. ご希望"),
      qa(["改善したい優先順位", "ご予算のイメージ", "補助金活用の意向", "その他・自由記入"]),
    ],
  };
}

// ---------- 3. 改善マップ（A4横・1枚） ----------
function kaizenMap() {
  const widths = [2500, 3000, 2600, 3100, 1900, 1500, 800];
  const W = widths.reduce((a, b) => a + b, 0);
  const header = ["業務", "現状（方法・時間/月）", "課題", "打ち手（改善案）", "期待効果（時間/月）", "概算費用", "優先度"];
  return {
    properties: {
      page: {
        size: { orientation: PageOrientation.LANDSCAPE },
        margin: { top: 620, bottom: 620, left: 720, right: 720 },
      },
    },
    children: [
      p([run("業務改善マップ", { size: 36, bold: true })], { after: 40 }),
      p([run("会社名：　　　　　　　　　　　　／　診断日：　　　　年　　月　　日　／　作成：", { size: 20 })], { after: 140 }),
      new Table({
        columnWidths: widths,
        rows: [
          new TableRow({ children: header.map((h, i) => cell(h, widths[i], { fill: ACCENT, bold: true, size: 20 })) }),
          ...Array.from({ length: 6 }, (_, r) => new TableRow({
            height: { value: 700, rule: HeightRule.ATLEAST },
            children: widths.map((w, i) => cell("", w, { fill: r % 2 ? GREY : undefined })),
          })),
        ],
      }),
      p([run("進め方のご提案", { size: 24, bold: true, color: ACCENT })], { before: 200, after: 60 }),
      new Table({
        columnWidths: [2600, 12800],
        rows: [
          new TableRow({ height: { value: 600, rule: HeightRule.ATLEAST }, children: [cell("すぐやる（効果大・費用小）", 2600, { fill: LIGHT, bold: true }), cell("", 12800)] }),
          new TableRow({ height: { value: 600, rule: HeightRule.ATLEAST }, children: [cell("次にやる", 2600, { fill: LIGHT, bold: true }), cell("", 12800)] }),
          new TableRow({ height: { value: 600, rule: HeightRule.ATLEAST }, children: [cell("今回は見送り", 2600, { fill: LIGHT, bold: true }), cell("", 12800)] }),
        ],
      }),
    ],
  };
}


// ---------- 4. 専門家プロフィール（経歴書・A4） ----------
function profile() {
  const W = 9740;
  const career = [
    ["1982〜1993", "ポンプ関係の会社", "セールスエンジニアとして営業・技術職に従事。1991年より営業所長"],
    ["1994〜2003", "建設会社（土木）", "現場監督を経て営業所長。官公庁への営業、建設コンサルタントへの提案営業、土木設計業務"],
    ["2003〜2007", "同社系列会社", "海運会社・民間企業向けコンテナのリース・販売。中国メーカーとの契約・発注業務"],
    ["2007〜2018", "独立（自営）", "土木設計、損害保険会社の補償工事の仲介"],
    ["2019〜2021", "児童福祉施設・個人病院", "開設に事務長として従事（許認可・体制整備・運営基盤づくり）"],
    ["2022〜2023", "公益社団法人（経営企画課）", "児童発達支援事業所の発足に従事"],
    ["2024〜2025", "建設会社", "施工と設計の一体化を図る部署の責任者。現場改革と社内業務のDX化を推進"],
    ["2026〜現在", "独立（自営）", "中小企業向け業務改善の受託。診断から自動化ツールの実装まで一気通貫で支援"],
  ];
  const careerTable = new Table({
    columnWidths: [1700, 2800, 5240],
    rows: [
      new TableRow({ children: [
        cell("期間", 1700, { fill: LIGHT, bold: true }),
        cell("所属", 2800, { fill: LIGHT, bold: true }),
        cell("主な業務", 5240, { fill: LIGHT, bold: true }),
      ]}),
      ...career.map(([y, org, desc]) => new TableRow({ children: [
        cell(y, 1700), cell(org, 2800), cell(desc, 5240),
      ]})),
    ],
  });
  return {
    properties: { page: { margin: { top: 560, bottom: 560, left: 850, right: 850 } } },
    children: [
      p([run("専門家プロフィール", { size: 34, bold: true })], { align: AlignmentType.CENTER, after: 40 }),
      p([run("建設・土木の業務改善コンサルタント（現場帳票のデジタル化・自動化ツール実装）", { size: 22, bold: true, color: ACCENT })], { align: AlignmentType.CENTER, after: 120 }),

      new Table({
        columnWidths: [2200, 7540],
        rows: [
          new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: [cell("氏名", 2200, { fill: GREY, bold: true }), cell("【氏名を記入】", 7540)] }),
          new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: [cell("屋号", 2200, { fill: GREY, bold: true }), cell("【屋号を記入】", 7540)] }),
          new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: [cell("連絡先", 2200, { fill: GREY, bold: true }), cell("【電話】000-0000-0000　【メール】example@example.com", 7540)] }),
          new TableRow({ height: { value: 420, rule: HeightRule.ATLEAST }, children: [cell("保有資格", 2200, { fill: GREY, bold: true }), cell("【保有資格を記入（例：土木施工管理技士 等）】", 7540)] }),
        ],
      }),

      heading("プロフィール要約", { before: 120 }),
      p("建設・土木業界に44年携わり、現場監督・土木設計・官公庁営業・営業所長・DX推進部署の責任者を歴任。発注者（官公庁）側の事情と下請の現場感覚の両方を理解した業務改善を持ち味とする。福祉施設・病院・事業所の開設（事務長・経営企画）など、異業種での事業立ち上げ経験も持つ。2026年に独立し、中小建設業を中心に、業務の棚卸し診断からExcel・AI等を使った自動化ツールの実装までを一気通貫で支援している。", { size: 20, after: 80 }),

      heading("専門分野", { before: 120 }),
      p("建設・土木業の業務改善（日報・工程・安全書類・請求まわりの事務負担軽減）", { bullet: true }),
      p("紙・Excel業務の自動化ツール開発（Excel VBA／Python／生成AI活用）", { bullet: true }),
      p("元請指定様式との二重入力解消、施工管理アプリの導入・定着支援", { bullet: true }),
      p("福祉・医療施設の開設支援（許認可・体制整備）", { bullet: true }),
      p("デジタル化・AI導入補助金など、IT関連補助金の活用相談", { bullet: true }),

      heading("支援メニュー", { before: 120 }),
      p([run("現場業務の棚卸し診断　", { size: 20, bold: true }), run("90分の訪問ヒアリングで業務を棚卸しし、改善マップと自動化の概算見積りを納品", { size: 20 })], { step: true }),
      p([run("自動化ツールの実装　", { size: 20, bold: true }), run("Excel転記の自動化・日報のスマホ化・書類の自動作成などを個別開発", { size: 20 })], { step: true }),
      p([run("導入・定着の伴走支援　", { size: 20, bold: true }), run("ツール選定から「現場が使い続ける」仕組みづくりまで", { size: 20 })], { step: true }),

      heading("職務経歴", { before: 120 }),
      careerTable,

      heading("強み", { before: 120 }),
      p("現場・設計・営業・経営のすべての視点を持ち、経営者とも職人とも同じ言葉で話せる", { bullet: true }),
      p("事業立ち上げ4件（福祉施設・病院・支援事業所・社内新部署）を実務で完遂", { bullet: true }),
      p("VBA・Pythonによる事務処理自動化ツールの開発実績。生成AIを日常業務で活用", { bullet: true }),
    ],
  };
}

const docs = [
  ["shindan-annai.docx", flyer()],
  ["hearing-sheet.docx", hearingSheet()],
  ["kaizen-map.docx", kaizenMap()],
  ["senmonka-profile.docx", profile()],
];

(async () => {
  for (const [name, section] of docs) {
    const doc = new Document({ numbering, sections: [section], styles: { default: { document: { run: { font: JP } } } } });
    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(name, buf);
    console.log("written", name);
  }
})();
