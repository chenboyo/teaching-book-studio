# 架構決策紀錄 (Architecture Decision Records)

本檔案記錄本專案的重要架構決策。每項決策包含背景（Context）、決策內容（Decision）、後果與權衡（Consequences）。

---

## ADR-001: 建立 Project-Scoped Agent 基礎架構與雙軌記憶系統 (Dual-Track Memory)

- **日期**：2026-11-20
- **狀態**：Accepted (已採納)

### 背景 (Context)
從「互動教學遊戲實驗室」轉型為「易懂教學教材與展示簡報工作坊」後，AI 代理人不僅要維護軟體工程品質，還需長期跨章節維持一致的教學語氣、認知密度節流與跨書籍專有名詞定義。若僅有工程向記憶庫，不同對話產出的教材容易出現術語不一、口吻生硬或文字牆膨脹。

### 決策 (Decision)
1. 承襲 `.agents/` 專案級標準目錄與 Windows UTF-8 / `.gitattributes` LF 防護，並重寫專案根憲章 `AGENTS.md`、`GEMINI.md` 與索引 `MEMORY.md`。
2. 將 `.agents/memory/` 升級為 **7 檔案雙軌記憶架構**：
   - **工程與流程軌（5 檔）**：`project_context.md`、`active_context.md`、`decisions.md`、`learnings.md`、`scratchpad.md`。
   - **教學與編審軌（2 檔）**：`editorial_style.md`（目標受眾、親切口語化人設、Mayer 12 原則規範與簡報密度預算）與 `curriculum_glossary.md`（全站跨書籍專有名詞中英對照、白話定義、生活比喻與系列知識地圖）。
3. 在 `.agents/rules/` 新增 `pedagogy-and-design.md`，將認知負荷上限與視覺證據比例列為與 Coding Standards 同級的硬規範。

### 後果 (Consequences)
- **正面效果**：任何新對話或蜂群子代理人在撰寫新單元前，能直接繼承統一語氣與詞彙表，避免術語漂移與認知超載。
- **維護成本**：新增跨書核心詞彙後需同步登錄至 `curriculum_glossary.md`，並於回合結束執行過期檢查。

---

## ADR-002: 流體教材-簡報雙模架構與零依賴離線單檔打包器 (`Fluid Document-Slide UX`)

- **日期**：2026-11-20
- **狀態**：Accepted (已採納)

### 背景 (Context)
傳統工具迫使教學者在「長篇可探索網頁教材（如 mdBook / Quarto）」與「線性講課簡報（如 Reveal.js / Slidev）」之間二選一，且多數依賴龐大的前端構建鏈或伺服器環境，不利於離線教室雙擊開啟與印製講義。

### 決策 (Decision)
1. **單一資料來源雙模呈現（Single-Source Dual-Mode）**：每本教材在 `books/<slug>/src/data/content.js` 維護一份結構化資料，`shared/engine/bookViewer.js` 依 URL `?mode=book|slide` 或即時切換鈕，無縫渲染為：
   - **教材閱讀模式（Book Mode）**：~68ch 閱讀欄寬、固定目錄側欄、進度條、點選式詞彙解釋彈窗與完整診斷測驗。
   - **簡報展示模式（Slide Mode）**：16:9 簡報舞台、方向性 View Transitions、單一 Tab 停駐工具列、總覽網格 (`G`)、講者備忘錄與計時器抽屜 (`N`)、以及全域快捷鍵。
   - **跨模式狀態保留**：互動探索元件的狀態（例如認知負荷模擬器的開關與複雜度滑桿）統一保存於瀏覽器元件狀態註冊表，切換 Book/Slide 模式時不遺失使用者操作結果。
2. **雙版型列印（Dual Print Modes）**：透過 `@media print` 與 `body[data-print-mode="book|handout"]`，同一網頁支援「完整教材列印」與「簡報畫面＋講者筆記講義」列印。
3. **Manifest 驅動 IIFE 離線打包**：沿用並強化 `scripts/build.mjs`，掃描 `books/*/book.json`，將 `shared/` 與 `books/<slug>/src/` 靜態轉譯為無衝突 IIFE，驗證 `new Function` 與無 `</script>` 漏洞，輸出可離線 `file://` 雙擊開啟的單檔 HTML。

### 後果 (Consequences)
- **正面效果**：一份資料同時滿足自學、現場授課、離線分發與紙本講義四種場景，零 npm 運行依賴。
- **權衡取捨**：所有跨模組匯入/匯出必須遵守靜態具名 ESM 語法並正確排序於 `book.json`；`file://` 離線模式需以 `try/catch` 保護 `history.replaceState`。

---

## ADR-003: 實證教學設計契約與自動化教學品管檢查器 (`pedagogyLinter.js`)

- **日期**：2026-11-20
- **狀態**：Accepted (已採納)

### 背景 (Context)
只具備漂亮的網頁排版並不等於「易懂的教材」。為了避免教材退化成塞滿條列文字、缺乏圖解或講稿寫在畫面上的傳統投影片，需要可量化、可重複測試的品質護欄。

### 決策 (Decision)
1. 將 **認知負荷理論（CLT）**、**Richard Mayer 多媒體學習 12 原則** 與 **Michael Alley 斷言-視覺證據設計** 轉化為結構化 Schema 與靜態分析規則，實作於純 JS 模組 `shared/engine/pedagogyLinter.js`（不依賴 DOM，可直接被 Node 測試與 CLI 呼叫）。
2. 稽核維度涵蓋：Schema 完整性、斷言式標題檢查（禁止空泛單名詞標題、控制字數上限）、單頁簡報文字密度上限（條列數與總字數）、視覺證據單元佔比（>= 60%）、行內 `[[glossaryId]]` 詞彙參照正確性、講者備忘錄覆蓋率、以及隨堂測驗回饋完整度。
3. 新增 `npm run audit-books`（`scripts/audit-books.mjs`），動態掃描全站書籍計算 0–100 分與等級，任何 Error 立即失敗退出（Exit Code 1），並整合進 `verify.ps1` 檢查鏈。

### 後果 (Consequences)
- **正面效果**：在編譯與 CI/驗證階段即可客觀攔截認知超載與結構缺漏，杜絕憑感覺寫死假分數。
- **權衡取捨**：作者需依規範填寫 `assertion`、`slidePoints`、`visual`/`widgetId` 與 `speakerNotes`，前期架構規劃稍嚴謹，但成書品質穩定維持高標。

---

## ADR-004: 教材工作坊專屬專案級技能體系 (10 Project-Scoped Skills)

- **日期**：2026-11-20
- **狀態**：Accepted (已採納)

### 背景 (Context)
原 `2026-11-20` 的 `learning-game-builder` 聚焦遊戲關卡與物理天平，已不符「教學教材與展示簡報製作」的工作流需求；同時需要更專注的教學分鏡設計與簡報品質審查技能。

### 決策 (Decision)
1. 將 `.agents/skills/` 調整為 10 項受 Git 追蹤的專案級技能：
   - **保留與對齊（6 項）**：`project-onboarding`、`session-memory-sync`、`worktree-manager`、`modern-web-guidance`、`cloudflare-pages-deploy`、`git-commit-push`。
   - **改造替換（1 項）**：以 `teaching-book-builder` 取代 `learning-game-builder`。
   - **全新建立（2 項）**：`pedagogical-content-architect`（教學目標、預習詞彙、分段與斷言-視覺分鏡設計）與 `presentation-qa-coach`（品管稽核、雙模狀態、快捷鍵與講義列印審查）。
   - **升級擴充（1 項）**：`verification-runner`（`verify.ps1` 改檢 4 份規則 + 7 份雙軌記憶 + `>= 8` 技能衛生 + `npm test` + `npm run audit-books` + `npm run build`；遠端檢查改以 `-RequireRemote` 控制，避免本地全新專案誤報失敗）。

### 後果 (Consequences)
- **正面效果**：從選題架構、名詞管理、網頁建置、教學品管到驗證部署形成完整閉環，且所有技能完全可攜並受 Git 追蹤。
- **維護成本**：新增書籍或調整驗證規則時需確保 `verify.ps1` 與技能說明保持同步。
