import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function usage() {
  console.error('用法：npm run new-book -- <slug> "<教材標題>" [分類] [目標對象]');
  console.error('範例：npm run new-book -- python-basics "Python 程式思維入門" "程式設計" "初學者"');
  process.exit(1);
}

const [, , slug, rawTitle, rawCategory = '教學專題', rawAudience = '一般學習者'] = process.argv;

if (!slug || !rawTitle || !/^[a-z0-9-]+$/.test(slug)) {
  usage();
}

const bookDir = path.join(rootDir, 'books', slug);
if (fs.existsSync(bookDir)) {
  console.error(`[new-book] 錯誤：目錄 books/${slug} 已存在，停止建立以免覆蓋既有檔案。`);
  process.exit(1);
}

fs.mkdirSync(path.join(bookDir, 'src/data'), { recursive: true });
fs.mkdirSync(path.join(bookDir, 'src/styles'), { recursive: true });
fs.mkdirSync(path.join(bookDir, 'tests'), { recursive: true });

// 1. book.json
fs.writeFileSync(
  path.join(bookDir, 'book.json'),
  JSON.stringify(
    {
      id: slug,
      title: rawTitle,
      entryHtml: 'index.html',
      contentModule: './src/data/content.js',
      styles: [
        '../../shared/styles/tokens.css',
        '../../shared/styles/book-reader.css',
        './src/styles/book.css',
      ],
      modules: [
        { key: 'bookEngine', path: '../../shared/engine/bookEngine.js' },
        { key: 'dialogHelper', path: '../../shared/ui/dialogHelper.js' },
        { key: 'toolbarHelper', path: '../../shared/ui/toolbarHelper.js' },
        { key: 'bookViewer', path: '../../shared/engine/bookViewer.js' },
        { key: 'content', path: './src/data/content.js' },
        { key: 'main', path: './src/main.js', isEntry: true },
      ],
    },
    null,
    2
  ) + '\n',
  'utf8'
);

// 2. index.html
fs.writeFileSync(
  path.join(bookDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="zh-Hant" data-theme="paper">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${rawTitle}</title>
  <link rel="stylesheet" href="../../shared/styles/tokens.css" />
  <link rel="stylesheet" href="../../shared/styles/book-reader.css" />
  <link rel="stylesheet" href="./src/styles/book.css" />
</head>
<body>
  <a href="#main-content" class="skip-link visually-hidden">跳至主要教材區</a>

  <header class="app-header">
    <div class="header-inner">
      <div class="brand-cluster">
        <span class="brand-icon" aria-hidden="true">📘</span>
        <div>
          <h1 class="brand-title">${rawTitle}</h1>
          <p class="brand-subtitle">${rawCategory}・${rawAudience}雙模互動教材與簡報</p>
        </div>
      </div>
      <div class="header-tools">
        <a href="../../index.html" class="tool-btn back-hub-link">🏠 回工作坊大廳</a>
      </div>
    </div>
  </header>

  <main id="main-content" tabindex="-1" class="app-main">
    <div id="book-app"></div>
  </main>

  <footer class="app-footer">
    <p>${rawTitle}・離線單檔雙模教學教材</p>
  </footer>

  <p id="sr-announcer" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p>

  <dialog id="overview-dialog" class="lab-dialog" closedby="any" aria-labelledby="overview-title">
    <div class="dialog-header">
      <h2 id="overview-title">🗂️ 單元與投影片總覽</h2>
      <form method="dialog">
        <button type="submit" value="close" class="dialog-close-btn" autofocus aria-label="關閉總覽">✕</button>
      </form>
    </div>
    <div id="overview-dialog-body" class="dialog-body"></div>
  </dialog>

  <dialog id="glossary-dialog" class="lab-dialog" closedby="any" aria-labelledby="glossary-title">
    <div class="dialog-header">
      <h2 id="glossary-title">📚 預習詞彙與術語表</h2>
      <form method="dialog">
        <button type="submit" value="close" class="dialog-close-btn" autofocus aria-label="關閉詞彙表">✕</button>
      </form>
    </div>
    <div id="glossary-dialog-body" class="dialog-body"></div>
  </dialog>

  <dialog id="print-dialog" class="lab-dialog" closedby="any" aria-labelledby="print-title">
    <div class="dialog-header">
      <h2 id="print-title">🖨️ 選擇列印版型</h2>
      <form method="dialog">
        <button type="submit" value="close" class="dialog-close-btn" autofocus aria-label="關閉列印選單">✕</button>
      </form>
    </div>
    <div class="dialog-body">
      <div style="display:grid;gap:0.75rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
        <button type="button" class="pill-btn is-active" data-print-choice="book">📖 列印完整教材</button>
        <button type="button" class="pill-btn" data-print-choice="handout">📽️ 列印簡報＋講者筆記講義</button>
      </div>
    </div>
  </dialog>

  <dialog id="shortcuts-dialog" class="lab-dialog" closedby="any" aria-labelledby="shortcuts-title">
    <div class="dialog-header">
      <h2 id="shortcuts-title">⌨️ 鍵盤快捷鍵</h2>
      <form method="dialog">
        <button type="submit" value="close" class="dialog-close-btn" autofocus aria-label="關閉快捷鍵">✕</button>
      </form>
    </div>
    <div class="dialog-body">
      <p>B 切換教材／簡報模式・← / → 換頁・G 總覽・N 講稿・D 詞彙・T 主題・P 列印</p>
    </div>
  </dialog>

  <script type="module" src="./src/main.js"></script>
</body>
</html>
`,
  'utf8'
);

// 3. src/styles/book.css
fs.writeFileSync(
  path.join(bookDir, 'src/styles/book.css'),
  `/* Custom book styles for ${slug} */\n`,
  'utf8'
);

// 4. src/data/content.js (starter passing pedagogyLinter)
fs.writeFileSync(
  path.join(bookDir, 'src/data/content.js'),
  `export const BOOK_DATA = {
  id: '${slug}',
  title: '${rawTitle}',
  subtitle: '${rawCategory}・易懂概念與實戰圖解',
  category: '${rawCategory}',
  audience: '${rawAudience}',
  level: '入門',
  estimatedMinutes: 3,
  learningObjectives: [
    '先透過詞彙預習與生活比喻建立直覺概念，降低學習阻礙。',
    '搭配結構化視覺圖解與隨堂測驗，檢核自己是否真正理解核心原則。',
  ],
  glossary: [
    {
      id: 'core-concept',
      term: '核心概念',
      en: 'Core Concept',
      definition: '支撐整個單元運作的最關鍵原理，先懂它就能串起所有細節。',
      analogy: '就像地圖上的主幹道，先看懂主路就不會在小巷弄裡迷路。',
    },
    {
      id: 'mental-model',
      term: '心智模型',
      en: 'Mental Model',
      definition: '我們在腦中用來預測事物如何運作的簡化想像圖。',
      analogy: '就像開水龍頭前，心裡自然知道往左轉會出熱水的直覺模型。',
    },
  ],
  units: [
    {
      id: 'unit-1-overview',
      title: '先看全局地圖',
      tag: '第 1 站・起點',
      durationSec: 60,
      assertion: '先建立清晰的 [[mental-model]]，能讓後續學習所有細節變得輕鬆三倍',
      slidePoints: [
        '把複雜知識拆解成「起點 → 核心 → 應用」三步',
        '先看懂圖解關係，再展開深入細節說明',
      ],
      bookProse: [
        '歡迎來到《${rawTitle}》！在深入細節之前，我們先用一張圖認識本教材的 [[core-concept]] 與 [[mental-model]]。',
        '你可以點擊上方的「📽️ 簡報展示」按鈕切換成投影舞台，或留在教材閱讀模式慢慢深讀。',
      ],
      visual: {
        caption: '三步驟學習路徑圖',
        svg: '<svg viewBox="0 0 480 120" role="img" aria-label="三步驟路徑"><rect x="14" y="24" width="130" height="72" rx="10" fill="#e3eaf5" stroke="#1b365d" stroke-width="2"/><text x="79" y="65" text-anchor="middle" font-size="13" font-weight="800" fill="#1b365d">1. 名詞預習</text><rect x="174" y="24" width="130" height="72" rx="10" fill="#fef3c7" stroke="#b45309" stroke-width="2"/><text x="239" y="65" text-anchor="middle" font-size="13" font-weight="800" fill="#b45309">2. 圖解原理</text><rect x="334" y="24" width="130" height="72" rx="10" fill="#dcfce7" stroke="#15803d" stroke-width="2"/><text x="399" y="65" text-anchor="middle" font-size="13" font-weight="800" fill="#15803d">3. 實戰演練</text></svg>',
      },
      speakerNotes:
        '開場花一分鐘介紹這份教材的學習地圖，提醒學員先不用背專有名詞，有需要隨時點擊橘色標籤查看解釋。',
    },
    {
      id: 'unit-2-check',
      title: '隨堂觀念確認',
      tag: '第 2 站・演練',
      durationSec: 60,
      assertion: '透過主動測驗與即時診斷回饋，能將剛學到的知識鎖定進長期記憶',
      slidePoints: [
        '每個核心觀念後面都值得設計一道快速檢核題',
        '錯誤選項也要明確告訴你「為什麼不適合」',
      ],
      bookProse: [
        '閱讀完基礎架構後，試著回答下方的隨堂思考題。無論選對或選錯，系統都會立即給你具體的觀念回饋。',
      ],
      quiz: {
        question: '開始設計一個複雜主題的教學簡報前，優先完成哪一件事最有助於聽眾吸收？',
        options: [
          {
            text: '先把整本參考書的文字逐段複製貼到投影片上',
            explanation: '把大段文字直接貼在簡報上會引發冗餘效應與工作記憶過載，反而不易吸收。',
          },
          {
            text: '先定義關鍵名詞的生活比喻，並用結論句搭配視覺圖解呈現重點',
            explanation: '完全正確！結合詞彙預習與斷言-視覺證據設計，能同時降低理解門檻與眼神搜尋負擔。',
          },
        ],
        correctIndex: 1,
      },
      speakerNotes:
        '請學員花 30 秒思考這道選擇題，並針對錯誤選項說明為什麼長篇文字牆會降低課堂互動品質。',
    },
  ],
};
`,
  'utf8'
);

// 5. src/main.js
fs.writeFileSync(
  path.join(bookDir, 'src/main.js'),
  `import { BOOK_DATA } from './data/content.js';
import { mountBookViewer } from '../../../shared/engine/bookViewer.js';

function init() {
  mountBookViewer({
    book: BOOK_DATA,
    widgets: {},
    rootSelector: '#book-app',
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
`,
  'utf8'
);

// 6. tests/book.test.js
fs.writeFileSync(
  path.join(bookDir, 'tests/book.test.js'),
  `import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOK_DATA } from '../src/data/content.js';
import { lintBook } from '../../../shared/engine/pedagogyLinter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookDir = path.resolve(__dirname, '..');

test('${slug} manifest & pedagogy lint pass cleanly', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(bookDir, 'book.json'), 'utf8'));
  assert.equal(manifest.id, '${slug}');
  const report = lintBook(BOOK_DATA);
  assert.equal(report.errors.length, 0);
  assert.equal(report.passed, true);
});
`,
  'utf8'
);

// 7. Auto-register into shared/catalog.js
const catalogPath = path.join(rootDir, 'shared/catalog.js');
const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
const newEntry = `  {
    id: '${slug}',
    title: '${rawTitle}',
    subtitle: '${rawCategory}・雙模互動教學教材與簡報',
    category: '${rawCategory}',
    audience: '${rawAudience}',
    level: '入門',
    icon: '📘',
    accent: '#1b365d',
    tags: ['${rawCategory}', '雙模簡報', '圖解教學'],
    description: '符合認知負荷與斷言-視覺證據設計的雙模互動教學教材。',
    entry: './books/${slug}/index.html',
    storageKey: 'book_${slug}_progress_v1',
    unitCount: 2,
    estimatedMinutes: 3,
  },
];`;

if (catalogRaw.includes('\n];')) {
  fs.writeFileSync(catalogPath, catalogRaw.replace(/\n\];\s*$/, `\n${newEntry}\n`), 'utf8');
  console.log(`[new-book] 已建立 books/${slug}/ 並自動註冊至 shared/catalog.js！`);
} else {
  console.log(`[new-book] 已建立 books/${slug}/，請手動將其加入 shared/catalog.js。`);
}
