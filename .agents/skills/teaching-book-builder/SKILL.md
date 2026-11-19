---
name: teaching-book-builder
description: >-
  Scaffold, implement, register, audit, and bundle Zero-Server / Offline-First
  dual-mode teaching books and interactive visual widgets under books/<slug>/.
---

# 雙模教材與互動簡報建置技能 (Teaching Book Builder)

當使用者要在本工作坊新增教材、建立互動模擬元件、擴充單元內容或註冊書籍時，依本技能標準作業流執行。

## 執行步驟

### 1. 先查閱現代 Web 規範與雙軌記憶
- 撰寫 HTML/CSS/DOM 互動元件前，先使用 `modern-web-guidance` 查詢最新模式與降級方案。
- 確認 `.agents/memory/editorial_style.md` 與 `curriculum_glossary.md` 已對齊。

### 2. 使用腳手架建立書籍骨架
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run new-book -- <slug> "<書籍標題>" "<分類>" "<適合對象>"
```
- `<slug>` 僅限小寫英文、數字與連字號（`/^[a-z0-9-]+$/`）。
- 補齊 `shared/catalog.js` 中該書籍的 `subtitle`、`icon`、`accent`、`level`、`tags`、`description`、`storageKey`、`unitCount` 與 `estimatedMinutes`。

### 3. 撰寫教材資料 (`src/data/content.js`) 與互動元件 (`src/widgets/`)
- 匯出 `export const BOOK_DATA = { id, title, subtitle, category, audience, level, estimatedMinutes, learningObjectives, glossary, units }`。
- 在正文中需要行內預習詞彙處使用 `[[termId]]`。
- 若含互動探索元件（`widgetId`），於 `src/widgets/*.js` 匯出 `WIDGET_REGISTRY`：
  - 接收 `(container, { state, setState, mode, announce })`。
  - 使用 `state` 與 `setState(...)` 讀寫狀態，確保使用者在「教材閱讀模式」與「簡報展示模式」間切換時保留操作參數。
  - 將純計算邏輯抽離成無 DOM 相依的匯出函數，以利 Node 24 單元測試驗證。

### 4. 嚴格遵守 `scripts/build.mjs` IIFE 打包契約
離線打包器會將 `books/<slug>/book.json` 列出的 JS 模組轉為單檔 IIFE，**必須遵守**：
1. 僅使用靜態具名匯入：`import { a, b as c } from './path.js';`（不可使用 `import * as`、default import 或動態 `import()`）。
2. 僅使用頂層具名匯出：`export function ...`、`export class ...`、`export const/let/var ...`（不可使用 `export default`、`export { ... }` 或 `export *`）。
3. `book.json` 必須按拓撲順序排列 `modules`（被依賴者在先，最後一項標記 `"isEntry": true`），並設定 `"contentModule": "./src/data/content.js"` 供 `audit-books` 自動稽核。
4. JS 字串內絕對不可出現 `</script>` 字樣。

### 5. 測試、品管稽核與離線建置驗證
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm test
npm run audit-books
npm run build
```
- 確認 `npm run audit-books` 回報 0 Errors 且教學品質分數達標（目標 ≥ 90 / Grade A）。
- 確認 `dist/index.html` 與 `dist/books/<slug>/index.html` 順利產出且可離線雙擊開啟。
