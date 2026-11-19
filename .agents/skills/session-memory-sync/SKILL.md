---
name: session-memory-sync
description: >-
  Guide agents on reading, synchronizing, and pruning both Engineering Track and
  Editorial Track memory files across conversation boundaries.
---

# 雙軌會話記憶同步技能 (Dual-Track Session Memory Sync)

本技能規範代理人如何在工作階段開始、重大決策、教材詞彙演進與收尾交接時，維持 `.agents/memory/` 7 份記憶檔案的精準與零膨脹。

## 執行流程

### 步驟 1：開工前雙軌檢查 (Pre-flight Sync)
1. 讀取 [active_context.md](../../memory/active_context.md) 與 [project_context.md](../../memory/project_context.md) 掌握工程脈絡。
2. 若任務涉及教材撰寫、簡報分鏡或視覺修改，必讀 [editorial_style.md](../../memory/editorial_style.md) 與 [curriculum_glossary.md](../../memory/curriculum_glossary.md) 以統一語氣與詞彙定義。

### 步驟 2：過程即時沉澱 (In-flight Persistence)
- **重大架構選型**：於 [decisions.md](../../memory/decisions.md) 追加標準 ADR（背景、決策、正負影響）。
- **新增或修訂專有名詞**：同步登錄至 [curriculum_glossary.md](../../memory/curriculum_glossary.md)（含 `termId`、中文譯名、英文原名、白話定義、生活比喻與適用書籍）。
- **環境錯誤與修正**：即時將根因與防範對策寫入 [learnings.md](../../memory/learnings.md)。

### 步驟 3：收尾交接與過期清理 (Hand-off & Staleness Pruning)
1. 更新 `active_context.md`：將完成項目移入「最近完成」，並清楚撰寫「下一步」。
2. 檢視 `scratchpad.md`：將有效構想升格或清除已過時的臨時草稿。
3. 確認 `curriculum_glossary.md` 與書內 `BOOK_DATA.glossary` 的 `termId` 無孤立或拼寫歧義。
