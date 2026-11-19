# 跨教材專有名詞表與系列知識地圖 (Curriculum Glossary & Knowledge Map)

> **軌道定位**：本檔案屬於 **教學與編審記憶軌（Editorial Track）**。為確保全站多本教材與簡報之間的術語定義、譯名與直覺比喻完全統一，所有書籍使用的關鍵術語皆應登記於此，並與書內 `glossary` 欄位保持一致。

---

## 1. 核心專有名詞標準表 (Canonical Terminology)

| ID (`termId`) | 中文標準譯名 | 英文原名 | 一句話白話定義 | 生活化直覺比喻 | 適用書籍 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `working-memory` | **工作記憶** | Working Memory | 大腦當下用來暫存與處理新資訊的有限空間，一次大約只能同時握住 3 到 5 個資訊組塊。 | 就像書桌的「桌面大小」：一次攤開太多本書，書就會掉到地上，什麼也讀不進去。 | `cognitive-design-guide` |
| `cognitive-load` | **認知負荷** | Cognitive Load | 學習過程中對工作記憶產生的總負擔，分成主題本身的「本質負荷」、排版干擾的「外在負荷」與深化理解的「增生負荷」。 | 就像背包重量：真正要帶的課本（本質負荷）已經夠重了，別再塞進無關的石頭（外在負荷）。 | `cognitive-design-guide` |
| `assertion-evidence` | **斷言-視覺證據設計** | Assertion-Evidence Approach | 一種以「一句完整結論句」作為簡報主標題，並以「圖表、圖解或互動模擬」作為唯一主體證據的簡報架構。 | 像報紙頭條配現場照片：先看一眼標題就懂發生什麼事，再看照片立刻信服，而不是讀一長串條列備忘錄。 | `cognitive-design-guide` |
| `spatial-contiguity` | **空間緊鄰原則** | Spatial Contiguity Principle | 把說明文字直接放在對應圖解或元件旁邊，不讓學習者的眼睛在圖形與頁尾圖例之間來回跳躍搜尋。 | 就像捷運車廂門上直接標註站名，不用乘客自己去車廂角落翻對照表。 | `cognitive-design-guide` |
| `segmenting` | **分段節流原則** | Segmenting Principle | 將龐雜連續的知識拆成一個個短小、可由學習者自行決定何時按「下一步」的小單元。 | 像把整顆牛排切成一口一塊再吃，而不是要求一口氣整塊吞下去。 | `cognitive-design-guide` |
| `pre-training` | **名詞預習原則** | Pre-training Principle | 在講解複雜運作流程前，先讓學習者認識關鍵零件的名稱、外觀與角色，降低中途邊聽邊查的負擔。 | 像組裝樂高前先把特殊積木分類擺好並認得名稱，照說明書拼裝就會順暢十倍。 | `cognitive-design-guide` |

---

## 2. 教材系列知識地圖 (Book Series Knowledge Map)

| 書籍 Slug | 書名 | 分類 | 建議對象 | 前置依賴 | 狀態 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cognitive-design-guide` | 讓複雜變簡單：易懂教學教材與簡報設計指南 | 教學設計・簡報表達 | 教師・講師・教材製作人 | 無（基礎旗艦入口教材） | **Live (v1.0)** |

---

## 3. 名詞新增與修訂協定
- 製作新教材（`npm run new-book`）時，先查閱本表是否已有既定 `termId` 與中文譯名；若已有，**必須沿用相同 `termId` 與譯名**，確保跨教材一致性。
- 若新教材引入新核心詞彙，同步追加至上表，並在教材中透過 `[[termId]]` 語法建立可點選預習標籤。
