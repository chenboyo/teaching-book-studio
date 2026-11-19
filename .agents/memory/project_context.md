# 專案背景與架構總覽 (Project Context)

## 1. 專案基本資訊
- **專案名稱**：易懂教學教材與展示簡報工作坊 (Teaching Book & Presentation Studio / `2026-11-20-book-making`)
- **工作路徑**：`d:\GitDev\2026-11-20-book-making`
- **前身演進**：改造自 `2026-11-20`（Learning Games Hub）之零依賴離線平台與蜂群治理基底
- **運行平台**：Windows (PowerShell) / UTF-8 / Node v24+
- **版本控制**：Git (`main` 分支)
- **架構特質**：Zero-Server / Offline-First **流體教材-簡報雙模態平台**（`shared/` 共用引擎、閱讀器、Linter 與樣式 + `books/<slug>/` 獨立教材書籍目錄 + 自動離線單檔打包器）

## 2. 核心技術與教學哲學
1. **Fluid Document-Slide UX**：同一份結構化單元資料（`books/<slug>/src/data/content.js`）無縫切換「📖 教材閱讀模式」、「📽️ 斷言-視覺證據簡報模式」與「🖨️ 講義列印模式」，且互動元件狀態跨模式保留。
2. **Cognitive Science Backed**：全面貫徹 **Richard Mayer 多媒體學習 12 原則**、**認知負荷理論（CLT）** 與 **Michael Alley 斷言-視覺證據設計（Assertion-Evidence）**，並由純 JS `pedagogyLinter.js` 自動量化稽核。
3. **Zero-Server & Offline-First**：零 npm 運行依賴、程序化 inline SVG 圖解、三種閱讀主題（溫潤紙本 `paper` / 明亮 `light` / 深色 `dark`），支援 `scripts/build.mjs` 一鍵產出可 `file://` 雙擊執行的單檔 HTML。
4. **Dual-Track Memory & Curated Skills**：採工程軌（5 檔）＋編審軌（2 檔）雙軌記憶系統，搭配 10 項受 Git 追蹤之專案級技能。

## 3. 目錄結構職責
- `index.html` & `shared/`：工作坊大廳 (`hub.js`)、登錄目錄 (`catalog.js`)、純邏輯引擎 (`bookEngine.js`, `pedagogyLinter.js`)、雙模閱讀簡報控制器 (`bookViewer.js`)、無障礙元件 (`dialogHelper.js`, `toolbarHelper.js`) 與三主題樣式 (`tokens.css`, `hub.css`, `book-reader.css`)。
- `books/<slug>/`：各獨立教學教材（含 `book.json`、入口 HTML、`src/data/content.js`、`src/widgets/`、專屬樣式與無頭測試）。旗艦首發教材為 `cognitive-design-guide`（《讓複雜變簡單：易懂教學教材與簡報設計指南》）。
- `scripts/`：離線單檔打包器 (`build.mjs`)、開發伺服器 (`serve.mjs`)、新書腳手架 (`new-book.mjs`) 與全站教學品管稽核器 (`audit-books.mjs`)。
- `.agents/`、`AGENTS.md`、`GEMINI.md`、`MEMORY.md`：專案規範、雙軌記憶庫與 10 套專案級技能庫。
