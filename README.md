# 易懂教學教材與展示簡報工作坊（Teaching Book & Presentation Studio）

> 一份結構化知識來源，同時驅動 **📖 教材閱讀模式**、**📽️ 斷言-視覺證據簡報模式** 與 **🖨️ 講義列印模式**。  
> 全程 **Zero-Server / Offline-First**：零外部相依套件，內建無障礙快捷鍵工具列、詞彙預習卡片、互動式探索模擬器、講者備忘錄計時器與自動化教學品管 Linter。

---

## 設計與教學理論基礎

本專案並非一般靜態簡報範本，而是基於認知科學與教育科技實務打造的教材製作系統：

1. **認知負荷理論（Cognitive Load Theory）與 Richard Mayer 多媒體學習 12 原則**
   - 區分「本質負荷（主題難度）」、「外在負荷（雜亂排版／無關裝飾）」與「增生負荷（主動思考）」。
   - 透過 **詞彙預習（Pre-training）**、**分段節流（Segmenting）**、**文字緊鄰圖解（Spatial Contiguity）** 與 **精簡畫面＋講稿分離（Redundancy）**，把學習者有限的工作記憶留給真正重要的概念。
2. **Michael Alley 斷言-視覺證據設計（Assertion-Evidence）**
   - 拒絕「空泛標題＋條列文字牆」。每一頁簡報與教材單元都以一句 **完整結論句（Assertion）** 作為標題，搭配 **直接證實該結論的視覺圖解或互動模擬器（Visual Evidence）**。
3. **流體雙模態閱讀體驗（Fluid Document-Slide UX）**
   - **📖 教材閱讀模式（Book Mode）**：適合自學深讀，提供 ~68ch 舒適排版、固定目錄導覽、閱讀進度條、點選即看的專有名詞解釋卡、即時診斷測驗與嵌入互動實驗。
   - **📽️ 簡報展示模式（Slide Mode）**：適合現場授課與簡報，支援方向性 View Transitions 轉場、鍵盤快捷鍵（`←`/`→`/`Space`、`G` 總覽網格、`N` 講者備忘錄與計時器、`D` 詞彙庫、`B` 雙模切換、`T` 主題切換、`P` 列印講義），且 **互動元件的操作狀態在切換模式時全程保留**。
   - **🖨️ 講義列印模式**：支援「完整教材列印」與「簡報縮圖＋講者筆記講義（Handout）」雙版型輸出。

---

## 目錄架構總覽

```text
.
├── index.html                              # 教學教材與簡報展示工作坊大廳（分類篩選、搜尋、進度讀取）
├── package.json                            # 指令入口（test / build / serve / new-book / audit-books）
├── AGENTS.md / GEMINI.md / MEMORY.md       # 雙憲章與雙軌記憶系統總索引
├── .agents/
│   ├── memory/                             # 雙軌記憶庫（5 工程軌 + 2 編審軌：editorial_style, curriculum_glossary）
│   ├── rules/                              # 4 份專案規範（coding, git-worktrees, memory, pedagogy-and-design）
│   └── skills/                             # 10 套受 Git 追蹤的專案級技能庫
├── shared/                                 # 跨書籍共用核心引擎與樣式
│   ├── catalog.js                          # 教材登錄目錄
│   ├── hub.js                              # 工作坊大廳控制器（支援直接進入閱讀模式或簡報模式）
│   ├── engine/
│   │   ├── bookEngine.js                   # 純 JS 狀態機、閱讀進度計算、詞彙標記解析
│   │   ├── pedagogyLinter.js               # 教學品管自動化 Linter（認知密度、視覺證據比、詞彙與測驗檢查）
│   │   └── bookViewer.js                   # 雙模閱讀/簡報控制器（Toolbar、View Transitions、快捷鍵、計時器）
│   ├── ui/
│   │   ├── dialogHelper.js                 # 原生 <dialog> 頂層動畫與焦點輔助
│   │   └── toolbarHelper.js                # 單一 Tab 停駐工具列（focusgroup 漸進增強與方向鍵降級）
│   ├── styles/
│   │   ├── tokens.css                      # 三種閱讀主題（溫潤紙本 / 明亮 / 深色）、排版變數與轉場動畫
│   │   ├── hub.css                         # 工作坊大廳響應式 Container Query 網格
│   │   └── book-reader.css                 # 教材閱讀、16:9 簡報舞台、講者抽屜與 @media print 講義樣式
│   └── tests/                              # 目錄一致性與無頭引擎/Linter 120 局隨機測試
├── books/
│   └── cognitive-design-guide/             # 旗艦示範教材：《讓複雜變簡單：易懂教學教材與簡報設計指南》
│       ├── book.json                       # 模組拓撲相依清單（供離線單檔打包器與稽核器使用）
│       ├── index.html                      # 教材入口頁
│       ├── src/
│       │   ├── data/content.js             # 8 大單元結構化教材＋詞彙庫＋SVG 圖解＋互動測驗
│       │   ├── widgets/interactiveDemos.js # 兩款即玩探索元件（認知負荷模擬器、簡報前後改造對比台）
│       │   ├── styles/book.css             # 本書專屬圖解與模擬器樣式
│       │   └── main.js                     # 本書啟動入口
│       └── tests/book.test.js              # 本書品管分數、模擬器邏輯與 100 次隨機路徑測試
├── scripts/
│   ├── build.mjs                           # 自動掃描 books/*/book.json 產出全離線單檔 dist/
│   ├── serve.mjs                           # 本機開發靜態伺服器 (http://127.0.0.1:4173)
│   ├── new-book.mjs                        # 一鍵產生合規新教材腳手架
│   └── audit-books.mjs                     # 全站教材教學品管 CLI 報告
└── dist/                                   # （Git 忽略）離線單檔發布產物（雙擊即可閱讀與簡報）
```

---

## 常用指令

### 1. 啟動本機預覽伺服器
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run serve
```
開啟 `http://127.0.0.1:4173/index.html` 瀏覽工作坊大廳，或一鍵進入教材閱讀／簡報展示模式。

### 2. 執行單元與無頭模擬測試
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm test
```

### 3. 執行教學品管與認知負荷稽核
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run audit-books
```
自動檢查每本教材的斷言清晰度、單頁文字密度、視覺證據比例、詞彙連結完整性、講稿分離度與測驗診斷品質，並輸出 0–100 分與等級評比。

### 4. 打包成完全離線單檔（`dist/`）
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run build
```
產出 `dist/index.html` 與每本書獨立可攜的 `dist/books/<slug>/index.html`，無須伺服器即可雙擊開啟教學與簡報。

### 5. 快速建立一本新教材
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run new-book -- python-basics "Python 程式思維入門" "程式設計" "初學者"
```
會自動建立合規 `books/python-basics/` 骨架並註冊至 `shared/catalog.js`。

### 6. 全站基礎設施與技能衛生檢查
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
powershell -ExecutionPolicy Bypass -File .agents/skills/verification-runner/scripts/verify.ps1
```

---

## 專案級技能庫（`.agents/skills/`）

| 技能名稱 | 用途說明 |
| :--- | :--- |
| `project-onboarding` | 新工作階段導入、雙軌記憶檢查與環境對齊 |
| `session-memory-sync` | 同步工程軌與編審軌記憶庫、ADR 決策與過期清理 |
| `pedagogical-content-architect` | 依據認知負荷理論、Mayer 12 原則與斷言-視覺證據規劃易懂教材分鏡 |
| `teaching-book-builder` | 建立、擴充、註冊與驗證離線雙模教材書籍與互動模擬元件 |
| `presentation-qa-coach` | 執行教學品管 Linter、簡報節奏檢查、雙模狀態一致性與列印講義驗證 |
| `modern-web-guidance` | 查詢現代 Web 標準（View Transitions、Toolbar、主題切換、自然互動） |
| `worktree-manager` | 多子代理人並行編寫教材與元件時的 Git Worktree 隔離管理 |
| `verification-runner` | Git、雙軌記憶、技能衛生、`npm test`、`audit-books` 與離線建置驗證 |
| `cloudflare-pages-deploy` | 透過 Wrangler OAuth 一鍵將 `dist/` 靜態網站發布至 Cloudflare Pages |
| `git-commit-push` | Conventional Commit 驗證、安全防呆與安全推送至遠端 |
