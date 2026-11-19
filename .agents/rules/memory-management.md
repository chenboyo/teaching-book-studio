# 雙軌記憶系統維護與同步協定 (Dual-Track Memory Protocol)

## 1. 雙軌記憶分層架構
專案記憶存儲於 `.agents/memory/` 目錄中，由根目錄 `MEMORY.md` 索引，分為兩大軌道：

### 工程與流程軌（Engineering Track）
- **`project_context.md`**：專案定位、雙模架構、技術棧與目錄結構。
- **`active_context.md`**：當前進度、近期完成事項、下一步路線圖與阻礙。
- **`decisions.md`**：架構決策紀錄 (ADRs)。
- **`learnings.md`**：環境相容性問題、踩坑根因與修正清單。
- **`scratchpad.md`**：任務進行中的即時筆記與分鏡草稿。

### 教學與編審軌（Editorial & Pedagogical Track）
- **`editorial_style.md`**：目標學習者人物誌、對話式寫作語氣、Mayer 12 原則落地規範、斷言-視覺證據字數與密度預算。
- **`curriculum_glossary.md`**：全站跨書籍標準專有名詞中英對照、白話定義、生活比喻與系列知識地圖。

## 2. 記憶讀寫時機
1. **工作階段啟動 (Session Start)**：
   - 必讀 `active_context.md` 與 `project_context.md`。
   - 若任務涉及教材撰寫、簡報設計或品管審閱，**額外必讀 `editorial_style.md` 與 `curriculum_glossary.md`**。
2. **架構重大變更 (Major Architecture Decision)**：
   - 在 `decisions.md` 追加標準 ADR。
3. **詞彙新增或修訂 (Terminology Evolution)**：
   - 新教材引入核心概念時，同步更新 `curriculum_glossary.md`，確保跨書 `[[termId]]` 完全一致。
4. **發生錯誤或環境踩坑 (Errors & Corrections)**：
   - 沉澱根因與防範方案至 `learnings.md`。
5. **工作階段結束 (Session End)**：
   - 更新 `active_context.md` 的「最近完成」與「下一步」，清理 `scratchpad.md` 過期暫存，並執行過期條目淘汰檢查。
