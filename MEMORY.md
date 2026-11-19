# 專案記憶系統索引 (Project Memory Index)

歡迎閱讀「易懂教學教材與展示簡報工作坊」持久化記憶庫。本系統採用 **雙軌記憶架構（Dual-Track Memory Architecture）**，同時維護「工程實作記憶」與「教學編審記憶」，確保跨對話、跨子代理人協作時，程式碼品質與教材語氣、詞彙定義始終一致。

---

## 軌一：工程與流程記憶 (Engineering Track)

| 檔案 | 職責與用途 | 檢索與維護時機 |
| :--- | :--- | :--- |
| [project_context.md](./.agents/memory/project_context.md) | 專案定位、流體教材-簡報架構總覽、技術選型與目錄 map | 新回合起始或理解整體架構時閱讀 |
| [active_context.md](./.agents/memory/active_context.md) | 當前里程碑進度、已完成項目、下一步路線圖與阻礙 | 每次工作階段起始與收尾必讀必更 |
| [decisions.md](./.agents/memory/decisions.md) | 架構決策紀錄 (ADRs: Architecture Decision Records) | 變更技術規格、打包器或資料結構時查閱與追加 |
| [learnings.md](./.agents/memory/learnings.md) | Windows UTF-8 編碼、IIFE 限制、現代 Web 降級與踩坑清單 | 遇報錯、PowerShell 問題或瀏覽器相容檢查前查閱 |
| [scratchpad.md](./.agents/memory/scratchpad.md) | 暫存筆記、分鏡草稿與任務中繼思考板 | 任務進行中暫存使用，收尾時清理 |

---

## 軌二：教學與編審記憶 (Editorial & Pedagogical Track)

| 檔案 | 職責與用途 | 檢索與維護時機 |
| :--- | :--- | :--- |
| [editorial_style.md](./.agents/memory/editorial_style.md) | 學習者人物誌、口語化編寫語氣、Mayer 12 原則實踐與簡報密度預算 | 規劃或撰寫任何新教材／簡報單元前必讀 |
| [curriculum_glossary.md](./.agents/memory/curriculum_glossary.md) | 全站跨書籍統一專有名詞庫（中英對照、白話定義、生活比喻）與系列知識地圖 | 撰寫術語、建立 `glossary` 互動卡或審校名詞一致性時必讀必更 |

---

## 記憶維護與防過期守則
- 雙軌同步：工程修改看 `active_context.md` + `decisions.md`；教材編寫看 `editorial_style.md` + `curriculum_glossary.md`。
- 已具備專案級技能 `session-memory-sync` 與 `pedagogical-content-architect`，協助快速更新記憶庫並淘汰過時條目（Staleness Pruning）。
