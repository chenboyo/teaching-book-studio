/**
 * Structured Single-Source Content for `cognitive-design-guide`.
 * Drives Book Mode, Slide Mode (Assertion-Evidence), Glossary Popups, and Print Handouts.
 */
export const BOOK_DATA = {
  id: 'cognitive-design-guide',
  title: '讓複雜變簡單：易懂教學教材與簡報設計指南',
  subtitle: '認知負荷理論 × Mayer 多媒體 12 原則 × 斷言-視覺證據實戰',
  category: '教學設計・簡報表達',
  audience: '教師・講師・教材製作人',
  level: '實戰入門',
  estimatedMinutes: 8,
  learningObjectives: [
    '分辨學習過程中的「本質負荷」與應該砍除的「外在負荷」，主動替學習者釋放工作記憶。',
    '活用名詞預習（Pre-training）與空間緊鄰（Spatial Contiguity）設計零阻力的圖解教材。',
    '將塞滿條列文字的傳統簡報，改寫成一目了然的「斷言-視覺證據」簡報。',
    '運用單一資料來源同時驅動深度閱讀、現場簡報投影與附帶講稿的講義列印。',
  ],
  glossary: [
    {
      id: 'working-memory',
      term: '工作記憶',
      en: 'Working Memory',
      definition: '大腦當下用來暫存與處理新資訊的有限空間，一次大約只能同時握住 3 到 5 個資訊組塊。',
      analogy: '就像書桌的「桌面大小」：一次攤開太多本書，書就會掉到地上，什麼也讀不進去。',
    },
    {
      id: 'cognitive-load',
      term: '認知負荷',
      en: 'Cognitive Load',
      definition: '學習過程中對工作記憶產生的總負擔，分成主題本身的本質負荷、排版干擾的外在負荷與深化理解的增生負荷。',
      analogy: '就像登山背包重量：課本（本質負荷）已經夠重了，千萬別再往裡面塞無關的石頭（外在負荷）。',
    },
    {
      id: 'assertion-evidence',
      term: '斷言-視覺證據設計',
      en: 'Assertion-Evidence Approach',
      definition: '一種以「一句完整結論句」作為簡報主標題，並以「圖表、圖解或互動模擬」作為主體證據的簡報架構。',
      analogy: '像新聞頭條配現場照片：看一眼標題就懂結論，看圖表立刻相信，不用自己從文字堆裡猜重點。',
    },
    {
      id: 'spatial-contiguity',
      term: '空間緊鄰原則',
      en: 'Spatial Contiguity Principle',
      definition: '把說明文字直接放在對應圖解或元件旁邊，避免學習者的眼睛在圖形與頁尾圖例之間反覆跳躍。',
      analogy: '就像捷運車門上直接貼著站名路線圖，不用乘客自己去車廂角落翻對照表。',
    },
    {
      id: 'segmenting',
      term: '分段節流原則',
      en: 'Segmenting Principle',
      definition: '將龐雜連續的知識拆成一個個短小、可由學習者自行決定何時按「下一步」的小單元。',
      analogy: '像把大塊牛排切成像骰子一樣好入口的小塊，而不是要求一口氣整塊吞下。',
    },
    {
      id: 'pre-training',
      term: '名詞預習原則',
      en: 'Pre-training Principle',
      definition: '在講解複雜運作流程前，先讓學習者認識關鍵零件的名稱、外觀與角色，降低中途邊聽邊查的負擔。',
      analogy: '像拼樂高前先把特殊零件分類擺好、先認得名稱，照說明書組裝就會順暢十倍。',
    },
  ],
  units: [
    {
      id: 'unit-1-why-clarity-matters',
      title: '為何簡報總是記不住',
      tag: '第 1 站・核心問題',
      durationSec: 55,
      assertion: '聽眾記不住重點往往不是內容太難，而是排版把工作記憶塞爆了',
      slidePoints: [
        '大腦「桌面」一次只能握住 3–5 個資訊組塊',
        '同時讀滿屏文字又聽你講話，會造成雙重衝突',
        '好的設計不是做加法裝飾，而是主動幫大腦清出空間',
      ],
      bookProse: [
        '你有沒有過這樣的經驗？講台上投影片寫得密密麻麻、老師也講得很賣力，但下課五分鐘後，腦袋卻幾乎一片空白。這通常不是因為你不夠專心，而是人類大腦的 [[working-memory]] 容量本來就非常有限。',
        '當畫面同時塞滿無關的花邊、又長又密的條列文字，學習者光是「尋找哪裡是重點」就耗盡力氣，根本沒有空間消化真正想學的觀念。這本指南將帶你用四個步驟，把複雜知識改造成讀得懂、講得順的教材與簡報。',
      ],
      visual: {
        caption: '從認知爆表到清晰理解：易懂教材的四步驟改造路徑',
        svg: `<svg viewBox="0 0 640 165" role="img" aria-label="四步驟設計路徑：認識詞彙、移除雜訊、斷言加視覺證據、雙模交付">
          <rect x="8" y="18" width="136" height="126" rx="12" fill="#e3eaf5" stroke="#1b365d" stroke-width="2" />
          <text x="76" y="46" text-anchor="middle" font-size="13" font-weight="800" fill="#1b365d">1. 名詞預習</text>
          <text x="76" y="72" text-anchor="middle" font-size="11" fill="#1e293b">先認識零件名稱</text>
          <text x="76" y="92" text-anchor="middle" font-size="11" fill="#1e293b">與生活比喻</text>
          <text x="76" y="124" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1b365d">Pre-training</text>

          <path d="M148 80 L166 80" stroke="#1b365d" stroke-width="2.5" marker-end="url(#arrow1)" />
          <defs><marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#1b365d"/></marker></defs>

          <rect x="170" y="18" width="136" height="126" rx="12" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
          <text x="238" y="46" text-anchor="middle" font-size="13" font-weight="800" fill="#b45309">2. 減輕外在負荷</text>
          <text x="238" y="72" text-anchor="middle" font-size="11" fill="#1e293b">砍掉無關裝飾</text>
          <text x="238" y="92" text-anchor="middle" font-size="11" fill="#1e293b">把講稿移出畫面</text>
          <text x="238" y="124" text-anchor="middle" font-size="10.5" font-weight="700" fill="#b45309">Coherence</text>

          <path d="M310 80 L328 80" stroke="#1b365d" stroke-width="2.5" marker-end="url(#arrow1)" />

          <rect x="332" y="18" width="136" height="126" rx="12" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
          <text x="400" y="46" text-anchor="middle" font-size="13" font-weight="800" fill="#15803d">3. 斷言＋圖解</text>
          <text x="400" y="72" text-anchor="middle" font-size="11" fill="#1e293b">一句結論當主標</text>
          <text x="400" y="92" text-anchor="middle" font-size="11" fill="#1e293b">圖表緊鄰標註</text>
          <text x="400" y="124" text-anchor="middle" font-size="10.5" font-weight="700" fill="#15803d">Assertion-Evidence</text>

          <path d="M472 80 L490 80" stroke="#1b365d" stroke-width="2.5" marker-end="url(#arrow1)" />

          <rect x="494" y="18" width="138" height="126" rx="12" fill="#f1f5f9" stroke="#334155" stroke-width="2" />
          <text x="563" y="46" text-anchor="middle" font-size="13" font-weight="800" fill="#1e293b">4. 雙模靈活切換</text>
          <text x="563" y="72" text-anchor="middle" font-size="11" fill="#1e293b">閱讀深讀／簡報投影</text>
          <text x="563" y="92" text-anchor="middle" font-size="11" fill="#1e293b">附筆記講義列印</text>
          <text x="563" y="124" text-anchor="middle" font-size="10.5" font-weight="700" fill="#334155">Fluid Dual-Mode</text>
        </svg>`,
      },
      speakerNotes:
        '開場先請聽眾回想「上週看過最痛苦的一份簡報」。點出核心觀點：問題不在聽眾不認真，而是人的工作記憶只有 3–5 個槽位。按下右上方「簡報／教材」按鈕可以體驗同一份內容的兩種樣貌。',
    },
    {
      id: 'unit-2-pretraining-glossary',
      title: '先認得詞彙再學流程',
      tag: '第 2 站・名詞預習',
      durationSec: 65,
      assertion: '先用生活比喻認識核心詞彙，能讓後續複雜原理的理解速度翻倍',
      slidePoints: [
        '這是 Mayer「名詞預習原則（Pre-training）」的核心做法',
        '正文遇到橘色詞彙標籤，隨時一點就能展開白話解釋',
        '先記住「工作記憶＝書桌大小」，後面就能秒懂所有設計訣竅',
      ],
      bookProse: [
        '在開始說明設計原則之前，我們先應用 [[pre-training]]：先把全書會反覆出現的 6 個關鍵名詞擺上桌面。就像剛拿到一盒新桌遊，先看懂四張角色卡長什麼樣子，等一下讀遊戲規則時就不用邊讀邊翻說明書了。',
        '在本網站中，任何帶有暖橘底色的詞彙標籤（例如 [[cognitive-load]] 或 [[spatial-contiguity]]）都可以直接點擊，立刻跳出白話定義與生活比喻，讓你隨時補充前備知識而不會迷路。',
      ],
      glossaryFocusIds: [
        'working-memory',
        'cognitive-load',
        'assertion-evidence',
        'spatial-contiguity',
        'segmenting',
        'pre-training',
      ],
      speakerNotes:
        '這頁展示「名詞預習原則」：花一分鐘先帶大家看過這 6 個生活比喻，特別強調「工作記憶＝書桌大小」與「認知負荷＝背包重量」，接下來所有設計方法都會扣回這兩個比喻。',
    },
    {
      id: 'unit-3-cognitive-load-lab',
      title: '把書桌留給重要觀念',
      tag: '第 3 站・認知負荷模擬',
      durationSec: 90,
      assertion: '當我們主動砍掉外在干擾，大腦才有餘裕消化高難度知識',
      slidePoints: [
        '主題本身的難度是「本質負荷」，通常無法直接變少',
        '雜亂背景、重複文字牆是可被消除的「外在負荷」',
        '親自撥動下方模擬器的開關，觀察工作記憶如何騰出空間',
      ],
      bookProse: [
        '在 [[cognitive-load]] 理論裡，大腦面對的總負擔主要有兩部分：主題原本的複雜度叫做「本質負荷」，而因為簡報太亂、字太多造成的冤枉負擔叫做「外在負荷」。既然主題的本質難度是固定的，設計師唯一能做的，就是無情地削減外在負荷。',
        '試著操作下方的互動模擬器！把主題難度調到「中等」或「高難度」，再逐一打開減負開關。即使你現在切到「📽️ 簡報展示模式」，剛剛設定的模擬數值也會完整保留下來喔！',
      ],
      widgetId: 'cognitive-load-sim',
      quiz: {
        question: '當你要教一個本身就很複雜的主題（本質負荷很高）時，下列哪種做法最能避免學生工作記憶過載？',
        options: [
          {
            text: '加入更多活潑的動畫特效與幽默梗圖來提振精神',
            explanation: '看似有趣但與主題無關的圖片與特效屬於「誘惑細節」，會直接增加外在認知負荷，反而讓大腦更容易爆表。',
          },
          {
            text: '把流程拆成小步驟（分段），並把多餘裝飾與重複段落移出畫面',
            explanation: '正確！當本質負荷高時，必須靠分段節流與移除外在雜訊，才能騰出寶貴的工作記憶空間給核心概念。',
          },
          {
            text: '把口頭講解的逐字稿全部貼在投影片上讓大家自己對照讀',
            explanation: '把講稿與畫面文字雙重並列會觸發「冗餘效應」，視覺與聽覺互相搶資源，理解度反而下降。',
          },
        ],
        correctIndex: 1,
      },
      speakerNotes:
        '現場投影時請先讓「主題難度＝中等、四個開關全關」，指給聽眾看紅色的「工作記憶爆表」條。接著依序打開「移除裝飾」和「講稿移出畫面」，帶大家親眼看到綠色安全線以下的餘裕空間出現。',
    },
    {
      id: 'unit-4-mayer-three-pillars',
      title: 'Mayer 多媒體三大支柱',
      tag: '第 4 站・理論地圖',
      durationSec: 75,
      assertion: 'Richard Mayer 的 12 項多媒體原則全都能歸納為「去噪、分段、促進連結」三大策略',
      slidePoints: [
        '第一支柱「減少外在干擾」：去裝飾、畫重點、別把講稿貼滿畫面',
        '第二支柱「管理核心難度」：拆成短單元、先認名詞、圖配口語最省力',
        '第三支柱「促進主動思考」：圖文結合＋像朋友聊天一樣的語氣',
      ],
      bookProse: [
        '很多老師第一次聽到「多媒體學習 12 原則」會覺得背不完，其實只要記住它們共同服務的三個目的：第一是「清場」（砍掉與學習無關的干擾），第二是「控速」（用 [[segmenting]] 把難題切小口），第三是「搭橋」（用親切口吻與圖解幫助記憶）。',
        '特別要注意的是語氣個人化原則：把「學習者應於系統輸入參數」改成「我們先試著調整一個開關」，這種自然的對話感能讓大腦自動切換成「正在與人交流」的專注狀態。',
      ],
      visual: {
        caption: 'Richard Mayer 多媒體學習 12 原則三大策略總覽圖',
        svg: `<svg viewBox="0 0 640 215" role="img" aria-label="Mayer三大策略圖：1 減少外在負荷、2 管理本質負荷、3 促進增生連結">
          <rect x="12" y="14" width="196" height="186" rx="14" fill="#fee2e2" stroke="#b91c1c" stroke-width="2" />
          <text x="110" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#b91c1c">支柱一：砍掉外在雜訊</text>
          <text x="110" y="62" text-anchor="middle" font-size="10.5" fill="#7f1d1d">Stop Extraneous Processing</text>
          <text x="28" y="92" font-size="11.5" font-weight="700" fill="#1e293b">1. 極簡去噪 Coherence</text>
          <text x="28" y="114" font-size="11.5" font-weight="700" fill="#1e293b">2. 重點訊號 Signaling</text>
          <text x="28" y="136" font-size="11.5" font-weight="700" fill="#1e293b">3. 不念稿件 Redundancy</text>
          <text x="28" y="158" font-size="11.5" font-weight="700" fill="#1e293b">4. 圖文緊鄰 Spatial</text>
          <text x="28" y="180" font-size="11.5" font-weight="700" fill="#1e293b">5. 影音同步 Temporal</text>

          <rect x="222" y="14" width="196" height="186" rx="14" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
          <text x="320" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#b45309">支柱二：控管核心難度</text>
          <text x="320" y="62" text-anchor="middle" font-size="10.5" fill="#78350f">Manage Essential Load</text>
          <text x="238" y="98" font-size="11.5" font-weight="700" fill="#1e293b">6. 分段節流 Segmenting</text>
          <text x="238" y="128" font-size="11.5" font-weight="700" fill="#1e293b">7. 名詞預習 Pre-training</text>
          <text x="238" y="158" font-size="11.5" font-weight="700" fill="#1e293b">8. 雙通道口說 Modality</text>
          <text x="238" y="182" font-size="10.5" fill="#78350f">↳ 把書面文字轉成圖＋口語</text>

          <rect x="432" y="14" width="196" height="186" rx="14" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
          <text x="530" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#15803d">支柱三：促進深度連結</text>
          <text x="530" y="62" text-anchor="middle" font-size="10.5" fill="#14532d">Foster Generative Learning</text>
          <text x="448" y="96" font-size="11.5" font-weight="700" fill="#1e293b">9. 圖文雙碼 Multimedia</text>
          <text x="448" y="122" font-size="11.5" font-weight="700" fill="#1e293b">10. 親切對話 Personalization</text>
          <text x="448" y="148" font-size="11.5" font-weight="700" fill="#1e293b">11. 自然人聲 Voice</text>
          <text x="448" y="174" font-size="11.5" font-weight="700" fill="#1e293b">12. 畫面留給內容 Image</text>
        </svg>`,
      },
      callout: {
        type: 'tip',
        title: '實用記憶口訣：砍雜訊、切小塊、說人話',
        text: '設計新教材時只要反問自己這三個問題：畫面有沒有多餘裝飾？這一頁是不是只講一件事？語氣像不像跟朋友當面解釋？',
      },
      speakerNotes:
        '不需要叫大家死背 12 個英文名詞！只要讓聽眾記住這三色卡片：紅色砍雜訊、黃色切小塊、綠色搭橋樑。特別提醒第 12 點：視訊簡報角落不一定要放講者大頭框，內容清晰比臉更重要。',
    },
    {
      id: 'unit-5-assertion-evidence',
      title: '斷言＋視覺證據改造術',
      tag: '第 5 站・實戰改造',
      durationSec: 95,
      assertion: '將條列投影片改寫為「結論句標題＋視覺證據」，聽眾能立即抓到重點',
      slidePoints: [
        '傳統簡報寫「名詞主題＋五條長句子」，聽眾必須自己猜結論',
        '斷言標題用一句完整的「主詞＋動詞＋結論」直接告訴你答案',
        '下方切換「改造前／改造後」分頁，親自對比設計差異',
      ],
      bookProse: [
        '賓州州立大學 Michael Alley 教授提出的 [[assertion-evidence]]，被證明能顯著提升理工與教學簡報的理解率。規則非常單純卻極具威力：第一，把「第三章：分析結果」這種空泛標題，改成「近半數延遲源於需求變更，應優先設凍結點」的完整結論句。',
        '第二，把投影片中央原本塞滿的條列段落刪除，只留下真正能「證明這句話」的圖表、圖解或結構比較，並把補充細節放進講者備忘錄（按快捷鍵 N 即可展開）。請點擊下方分頁體驗這場「手術級改造」！',
      ],
      widgetId: 'slide-makeover',
      quiz: {
        question: '下列哪一個簡報主標題最符合「斷言-視覺證據（Assertion-Evidence）」設計精神？',
        options: [
          {
            text: '第二節：光合作用的過程與影響因素分析',
            explanation: '這只是一個主題標籤，看完標題仍然不知道「影響了什麼」或「結論為何」。',
          },
          {
            text: '提高光照強度能加速光合作用，但在高溫下會因氣孔關閉而停滯',
            explanation: '完全正確！它用一句完整的因果結論句作為標題，讓底下的曲線圖成為直接支持這句話的視覺證據。',
          },
          {
            text: '光合作用實驗數據表格（2026 年版）',
            explanation: '這只是圖表的名稱描述，依然把「推論出什麼規律」的苦差事丟給聽眾自己找。',
          },
        ],
        correctIndex: 1,
      },
      speakerNotes:
        '示範這個互動對比台時，先停在「改造前」問觀眾：「給你 5 秒鐘，你抓得到這頁最重要的一句話嗎？」接著切到「改造後」，讓大家體會只需 1 秒就能看懂 45% 主因與結論的暢快感。',
    },
    {
      id: 'unit-6-spatial-contiguity',
      title: '圖文緊鄰與視覺訊號',
      tag: '第 6 站・圖解美學',
      durationSec: 70,
      assertion: '把標籤直接放在圖解元件旁並用色彩引導視線，能立刻消除眼睛搜尋疲勞',
      slidePoints: [
        '分離式圖例（左圖＋右下方編號說明）強迫大腦不斷來回掃描',
        '[[spatial-contiguity]] 要求把文字直接標註在圖形對應位置旁',
        '運用「高對比墨藍＋低飽和灰」凸顯主角，其餘配角自動退後',
      ],
      bookProse: [
        '看過那種「圖上寫著 A、B、C、D 四個小圓圈，然後圖的下方再用極小字體寫著 A 代表什麼、B 代表什麼」的教材嗎？每當眼睛從 A 跳去圖例又跳回圖形，工作記憶就會漏掉一部分畫面，這正是違反 [[spatial-contiguity]] 的經典反例。',
        '解法很簡單：直接把名稱與簡短功用寫在圖形元件正旁邊，並用「視覺訊號」原則，將當前要強調的路徑畫成飽和墨藍或森林綠，其餘次要結構降為中性淺灰。下圖左邊與右邊的掃描負擔差距一目了然。',
      ],
      visual: {
        caption: '空間分離式圖例（左）vs 空間緊鄰直接標註＋色彩訊號（右）',
        svg: `<svg viewBox="0 0 640 190" role="img" aria-label="對比圖：左邊圖例與圖形分離導致眼神跳躍，右邊直接標註元件名稱並用高對比色標示關鍵路徑">
          <rect x="10" y="10" width="295" height="170" rx="12" fill="#fee2e2" stroke="#b91c1c" stroke-width="1.8" />
          <text x="157" y="34" text-anchor="middle" font-size="12.5" font-weight="800" fill="#b91c1c">❌ 反例：標籤分離（眼睛來回跳躍）</text>
          <rect x="44" y="54" width="52" height="38" rx="6" fill="#94a3b8" />
          <text x="70" y="77" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">(1)</text>
          <line x1="98" y1="73" x2="132" y2="73" stroke="#64748b" stroke-width="2" />
          <rect x="134" y="54" width="52" height="38" rx="6" fill="#94a3b8" />
          <text x="160" y="77" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">(2)</text>
          <line x1="188" y1="73" x2="220" y2="73" stroke="#64748b" stroke-width="2" />
          <rect x="222" y="54" width="52" height="38" rx="6" fill="#94a3b8" />
          <text x="248" y="77" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">(3)</text>
          <path d="M70 94 Q115 118 85 130" stroke="#b91c1c" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />
          <rect x="24" y="122" width="268" height="44" rx="8" fill="#ffffff" stroke="#fca5a5" />
          <text x="34" y="140" font-size="10.5" fill="#334155">圖例說明：(1) 輸入緩衝區  (2) 工作記憶處理核心</text>
          <text x="34" y="156" font-size="10.5" fill="#334155">(3) 長期記憶結構化儲存庫（眼神得來回對照！）</text>

          <rect x="335" y="10" width="295" height="170" rx="12" fill="#dcfce7" stroke="#15803d" stroke-width="1.8" />
          <text x="482" y="34" text-anchor="middle" font-size="12.5" font-weight="800" fill="#15803d">✅ 推薦：空間緊鄰＋高對比訊號</text>
          <rect x="352" y="58" width="76" height="58" rx="8" fill="#cbd5e1" />
          <text x="390" y="83" text-anchor="middle" font-size="11" font-weight="800" fill="#334155">感官輸入</text>
          <text x="390" y="101" text-anchor="middle" font-size="9.5" fill="#475569">過濾雜訊</text>

          <line x1="430" y1="87" x2="444" y2="87" stroke="#1b365d" stroke-width="2.5" />
          <rect x="446" y="52" width="88" height="70" rx="8" fill="#1b365d" />
          <text x="490" y="80" text-anchor="middle" font-size="11.5" font-weight="800" fill="#ffffff">工作記憶</text>
          <text x="490" y="99" text-anchor="middle" font-size="9.5" fill="#dbeafe">容量 3–5 塊</text>
          <text x="490" y="114" text-anchor="middle" font-size="9" font-weight="700" fill="#fde68a">★ 主角高亮</text>

          <line x1="536" y1="87" x2="550" y2="87" stroke="#15803d" stroke-width="2.5" />
          <rect x="552" y="58" width="66" height="58" rx="8" fill="#15803d" />
          <text x="585" y="83" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">長期記憶</text>
          <text x="585" y="101" text-anchor="middle" font-size="9.5" fill="#dcfce7">永久連結</text>
          <text x="482" y="156" text-anchor="middle" font-size="10.5" font-weight="700" fill="#14532d">文字直接貼合方塊，視線順著左→右一次掃完</text>
        </svg>`,
      },
      speakerNotes:
        '請聽眾比較左圖跟右圖的眼神動線：左圖要看懂 (2) 得先往下掃再往上回頭找，右圖直接順著由左到右的色彩節奏一次讀完，這就是空間緊鄰加上視覺訊號的威力。',
    },
    {
      id: 'unit-7-fluid-dual-mode',
      title: '一份教材驅動雙模與講義',
      tag: '第 7 站・工作流架構',
      durationSec: 70,
      assertion: '單一結構化資料來源能同時輸出「深度閱讀網頁、簡報舞台與講義列印」',
      slidePoints: [
        '不必再為了同一堂課維護 Word 講義與 PPT 兩份不同檔案',
        '按下 B 鍵切換閱讀／簡報模式，且互動模擬器的狀態不遺失',
        '內建雙版型 @media print，支援「純教材列印」與「簡報＋講稿講義」',
      ],
      bookProse: [
        '過去老師最頭痛的事，就是上課前才修改了簡報上的數據，卻忘記同步更新學生手上的講義或補充閱讀網頁。本工作坊採用「單一資料來源（Single-Source）」設計：整本教材的斷言、圖解、深讀散文、互動模擬與講稿全部寫在同一份結構化清單裡。',
        '當你需要自學或分享給學生預習時，切換為「📖 教材閱讀模式」；走上講台時一鍵切換為「📽️ 簡報展示模式」（並開啟講者備忘錄與計時器）；課程結束要印紙本講義時，按下 P 鍵即可輸出乾淨無多餘按鈕的簡報＋筆記講義！',
      ],
      comparison: {
        before: {
          title: '傳統雙檔分頭維護',
          points: [
            'PPT 與 Word 講義內容經常不同步',
            '簡報畫面塞滿文字，印出來卻沒有口語脈絡',
            '需要網路或軟體安裝才能打開檢視',
          ],
        },
        after: {
          title: '本工作坊流體雙模架構',
          points: [
            '同一份結構化單元自動對應閱讀與簡報兩套排版',
            '講稿分離存放於備忘錄，簡報乾淨、講義完整',
            '一鍵打包為單一離線 HTML 檔，雙擊即用',
          ],
        },
      },
      speakerNotes:
        '這裡可以當場按 P 鍵展示列印對話框，說明學生版「完整教材列印」與教師／預習版「簡報＋講者筆記講義」的差別，強調不用再維護兩份檔案的省時優勢。',
    },
    {
      id: 'unit-8-capstone-checklist',
      title: '上線前的自我檢核清單',
      tag: '第 8 站・實作驗收',
      durationSec: 65,
      assertion: '發行教材前用五項品管指標與自動化檢查把關，能確保每一頁都清晰好懂',
      slidePoints: [
        '執行 npm run audit-books 可自動檢測斷言、字數密度與圖解比',
        '確認每個專業詞彙都有白話定義與生活比喻',
        '完成下方終極隨堂測試，檢驗你是否已經掌握核心設計原則',
      ],
      bookProse: [
        '恭喜你走完這趟認知友善教材設計之旅！本工作坊內建了自動化教學品管工具（`pedagogyLinter.js`），會在你開發與交付前客觀檢查每一頁是否出現字數過載、漏掉詞彙定義或缺乏視覺證據。',
        '在正式發布你的第一本雙模教材之前，請先用最後一題隨堂診斷測驗暖身，並對照下方五點交付檢查清單，確保每位讀者和聽眾都能輕鬆吸收你的知識結晶。',
      ],
      checklist: [
        '每一頁的主標題都是一句「完整的結論斷言」，而非空泛章節名稱',
        '簡報重點不超過 4 條短句，詳細講解已妥善移至 bookProse 與 speakerNotes',
        '全書至少 60% 以上單元具備直接證明斷言的 SVG 圖解、對比卡或互動模擬器',
        '關鍵術語已透過 [[termId]] 綁定詞彙預習卡，且標籤直接貼在圖解對應位置旁',
        '執行 npm test、npm run audit-books 與 npm run build 全數通過 0 Errors',
      ],
      quiz: {
        question: '準備發布一份新教材時，發現其中一頁簡報有 6 條超過 40 字的重點且沒有配圖，依照本工作坊規範應該如何修改？',
        options: [
          {
            text: '把字體縮小成 12pt，硬塞進同一頁投影片並加上背景底紋',
            explanation: '縮小字體加上裝飾底紋會大幅惡化易讀性並製造外在負荷，是最危險的反模式。',
          },
          {
            text: '拆分成 2 個精簡單元、將長句子移入講稿與正文，並補上核心對比圖解',
            explanation: '完全正確！結合 Segmenting（拆分單元）、Redundancy（講稿分離）與 Assertion-Evidence（斷言＋視覺證據），這正是讓複雜變簡單的標準做法！',
          },
          {
            text: '在頁尾貼一張寫著「加油」的可愛插圖平衡空白',
            explanation: '無關的裝飾插圖違反極簡去噪（Coherence）原則，無助於理解文字牆。',
          },
        ],
        correctIndex: 1,
      },
      speakerNotes:
        '結尾引導大家直接打開終端機執行 npm run new-book 與 npm run audit-books，體驗工具如何即時回饋分數與修正建議。鼓勵大家把手邊最常講錯或學生最難懂的單元拿來改造成第一本雙模教材！',
    },
  ],
};
