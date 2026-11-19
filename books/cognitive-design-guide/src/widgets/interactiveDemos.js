/**
 * Interactive Explorable Widgets for `cognitive-design-guide`.
 * Pure evaluation helpers are exported separately for Node headless verification.
 */

export function evaluateCognitiveLoadState({
  complexity = 2,
  removeClutter = false,
  addSignaling = false,
  segmentSteps = false,
  avoidRedundantText = false,
} = {}) {
  const level = Math.max(1, Math.min(3, Number(complexity) || 2));
  const intrinsicLoad = level === 1 ? 28 : level === 2 ? 48 : 65;

  let extraneousLoad = 54;
  if (removeClutter) extraneousLoad -= 16;
  if (addSignaling) extraneousLoad -= 12;
  if (segmentSteps) extraneousLoad -= 12;
  if (avoidRedundantText) extraneousLoad -= 10;
  extraneousLoad = Math.max(4, extraneousLoad);

  const totalLoad = intrinsicLoad + extraneousLoad;
  const remainingCapacity = 100 - totalLoad;

  let status = 'optimal';
  let verdict = '✅ 認知空間充足！外在干擾已被排除，學習者有餘裕吸收核心概念。';
  if (totalLoad > 100) {
    status = 'overload';
    verdict = `🚨 工作記憶爆表（${totalLoad}%）！外在干擾擠爆書桌，學習者只會記得畫面很亂，忘記你在教什麼。`;
  } else if (totalLoad >= 82) {
    status = 'tight';
    verdict = `⚠️ 接近警戒線（${totalLoad}%）！雖未溢出但幾乎沒有餘裕思考，建議再開啟 1–2 項減負策略。`;
  }

  return {
    complexity: level,
    intrinsicLoad,
    extraneousLoad,
    totalLoad,
    remainingCapacity,
    status,
    verdict,
  };
}

export const SLIDE_MAKEOVER_DATA = {
  before: {
    headline: '第三章：影響軟體專案延遲的各項常見成因分析與回顧',
    bullets: [
      '根據過去年度統計顯示，需求頻繁變更是造成時程延宕的最主要因素之一，佔所有專案問題的 45%。',
      '其次是跨部門溝通不良與文件交接不清，約佔整體延遲因素的 30%，經常導致重工。',
      '第三則是測試自動化覆蓋率不足與環境配置差異，佔 25%，容易在最後一刻才發現系統缺陷。',
      '此外缺乏階段性檢核點與明確定義，也會讓團隊在執行中期迷失方向。',
    ],
    annotations: [
      '違反「斷言原則」：標題只寫章節名稱，聽眾看完仍不知道結論是什麼。',
      '違反「去冗餘原則」：把整段講稿直接貼上投影片，觀眾讀字就忙不過來，根本聽不進講者說話。',
      '缺少「視覺證據」：45% / 30% / 25% 是明確數據，卻用純文字描述，眼睛無法立刻看出主從比例。',
    ],
  },
  after: {
    headline: '近半數專案延遲（45%）源於需求變更，應優先鎖定需求凍結點',
    bars: [
      { label: '需求頻繁變更', pct: 45, highlight: true },
      { label: '跨部門交接不清', pct: 30, highlight: false },
      { label: '測試與環境差異', pct: 25, highlight: false },
    ],
    takeaways: [
      '前兩大風險合計佔延遲總因的 75%',
      '解法：上線前 2 週設立需求凍結與詞彙對齊檢核',
    ],
    annotations: [
      '符合「斷言標題」：主標題直接說出 45% 主因與行動結論。',
      '符合「空間緊鄰與訊號」：用橫條圖直接把比例排出來，並把最高項以深墨藍高亮標記。',
      '符合「去冗餘原則」：詳盡背景案例交給講者口述與教材正文，畫面只留核心圖表與 2 句重點。',
    ],
  },
};

function renderCognitiveLoadSimulator(container, ctx) {
  const defaults = {
    complexity: 2,
    removeClutter: false,
    addSignaling: false,
    segmentSteps: false,
    avoidRedundantText: false,
  };

  let current = { ...defaults, ...(ctx.getState ? ctx.getState() : ctx.state) };

  const renderDom = () => {
    const res = evaluateCognitiveLoadState(current);
    const barMax = 130;
    const intrinsicW = Math.round((res.intrinsicLoad / barMax) * 320);
    const extraneousW = Math.round((res.extraneousLoad / barMax) * 320);
    const limitX = Math.round((100 / barMax) * 320);

    const complexityName =
      res.complexity === 1 ? '基礎概念' : res.complexity === 2 ? '中等關聯' : '高難度多步驟';

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
        <strong>🎛️ 互動實驗室：工作記憶負荷模擬器（狀態跨模式保留）</strong>
        <span style="font-size:0.84rem;font-weight:800;color:var(--ink-secondary);">
          總負荷：${res.totalLoad}% / 上限 100%
        </span>
      </div>

      <div class="sim-slider-row" style="margin-top:0.65rem;">
        <label for="sim-complexity-range" style="font-weight:700;font-size:0.88rem;">
          📚 主題本質難度（Intrinsic Load）：<span style="color:var(--accent-primary);">${complexityName} (${res.intrinsicLoad}%)</span>
        </label>
        <input id="sim-complexity-range" type="range" min="1" max="3" step="1" value="${res.complexity}" style="width:160px;" />
      </div>

      <div class="sim-controls-grid" role="group" aria-label="減少外在負荷的設計開關">
        <button type="button" class="sim-toggle-btn" data-sim-key="removeClutter" aria-pressed="${current.removeClutter}">
          ${current.removeClutter ? '✅' : '⬜'} 移除無關裝飾與背景（-16%）
        </button>
        <button type="button" class="sim-toggle-btn" data-sim-key="addSignaling" aria-pressed="${current.addSignaling}">
          ${current.addSignaling ? '✅' : '⬜'} 用色彩訊號標出重點（-12%）
        </button>
        <button type="button" class="sim-toggle-btn" data-sim-key="segmentSteps" aria-pressed="${current.segmentSteps}">
          ${current.segmentSteps ? '✅' : '⬜'} 拆分成短單元分段學（-12%）
        </button>
        <button type="button" class="sim-toggle-btn" data-sim-key="avoidRedundantText" aria-pressed="${current.avoidRedundantText}">
          ${current.avoidRedundantText ? '✅' : '⬜'} 講稿移出畫面不重複（-10%）
        </button>
      </div>

      <svg viewBox="0 0 360 76" role="img" aria-label="工作記憶負荷量表：本質負荷 ${res.intrinsicLoad}% 加 外在負荷 ${res.extraneousLoad}% 等於 ${res.totalLoad}%">
        <rect x="16" y="20" width="320" height="28" rx="6" fill="#e2e8f0" />
        <rect x="16" y="20" width="${intrinsicW}" height="28" rx="4" fill="#1b365d" />
        <rect x="${16 + intrinsicW}" y="20" width="${extraneousW}" height="28" rx="4" fill="${res.status === 'overload' ? '#b91c1c' : '#d97706'}" />
        <line x1="${16 + limitX}" y1="10" x2="${16 + limitX}" y2="58" stroke="#15803d" stroke-width="2.5" stroke-dasharray="4 3" />
        <text x="${16 + limitX}" y="9" text-anchor="middle" font-size="9.5" font-weight="800" fill="#15803d">100% 工作記憶上限</text>
        <text x="16" y="68" font-size="10" font-weight="700" fill="#1b365d">■ 本質負荷 ${res.intrinsicLoad}%</text>
        <text x="128" y="68" font-size="10" font-weight="700" fill="${res.status === 'overload' ? '#b91c1c' : '#b45309'}">■ 外在雜訊 ${res.extraneousLoad}%</text>
        <text x="242" y="68" font-size="10" font-weight="700" fill="#15803d">剩餘空間 ${Math.max(0, res.remainingCapacity)}%</text>
      </svg>

      <div class="sim-verdict is-${res.status}" role="status">${res.verdict}</div>
    `;
  };

  container.addEventListener('input', (event) => {
    if (event.target.id === 'sim-complexity-range') {
      current = { ...current, complexity: Number(event.target.value) };
      ctx.setState(current);
      renderDom();
    }
  });

  container.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-sim-key]');
    if (!btn) return;
    const key = btn.getAttribute('data-sim-key');
    current = { ...current, [key]: !current[key] };
    ctx.setState(current);
    renderDom();
    ctx.announce?.('已更新工作記憶負荷模擬結果');
  });

  renderDom();
}

function renderSlideMakeover(container, ctx) {
  const defaults = { view: 'before', showAnnotations: true };
  let current = { ...defaults, ...(ctx.getState ? ctx.getState() : ctx.state) };

  const renderDom = () => {
    const isAfter = current.view === 'after';
    const data = isAfter ? SLIDE_MAKEOVER_DATA.after : SLIDE_MAKEOVER_DATA.before;

    container.innerHTML = `
      <div class="makeover-tabs">
        <button type="button" class="pill-btn" data-makeover-tab="before" aria-pressed="${!isAfter}">❌ 改造前：條列文字牆</button>
        <button type="button" class="pill-btn" data-makeover-tab="after" aria-pressed="${isAfter}">✅ 改造後：斷言＋視覺證據</button>
        <button type="button" class="tool-btn" data-makeover-notes="toggle" aria-pressed="${current.showAnnotations}" style="margin-left:auto;">
          🔍 ${current.showAnnotations ? '隱藏批註' : '顯示設計批註'}
        </button>
      </div>

      <div class="makeover-preview ${isAfter ? 'is-good' : 'is-bad'}">
        <div style="font-size:0.78rem;font-weight:800;color:var(--ink-secondary);margin-bottom:0.25rem;">
          ${isAfter ? 'ASSERTION-EVIDENCE SLIDE PREVIEW' : 'TRADITIONAL BULLET SLIDE PREVIEW'}
        </div>
        <h4 style="font-size:1.05rem;margin-bottom:0.65rem;">${data.headline}</h4>
        ${
          isAfter
            ? `
              <svg viewBox="0 0 360 110" role="img" aria-label="專案延遲原因長條圖：需求變更 45%、交接不清 30%、測試環境 25%">
                ${data.bars
                  .map((b, idx) => {
                    const y = 12 + idx * 32;
                    const barW = Math.round((b.pct / 50) * 180);
                    return `
                      <text x="8" y="${y + 15}" font-size="11" font-weight="700" fill="#1e293b">${b.label}</text>
                      <rect x="115" y="${y}" width="${barW}" height="20" rx="5" fill="${b.highlight ? '#1b365d' : '#94a3b8'}" />
                      <text x="${122 + barW}" y="${y + 15}" font-size="11" font-weight="800" fill="${b.highlight ? '#1b365d' : '#475569'}">${b.pct}%</text>
                    `;
                  })
                  .join('')}
              </svg>
              <ul style="margin:0.45rem 0 0;padding-left:1.2rem;font-size:0.88rem;font-weight:700;">
                ${data.takeaways.map((t) => `<li>${t}</li>`).join('')}
              </ul>
            `
            : `
              <ul style="margin:0;padding-left:1.2rem;font-size:0.84rem;line-height:1.55;color:var(--ink-secondary);">
                ${data.bullets.map((b) => `<li style="margin-bottom:0.35rem;">${b}</li>`).join('')}
              </ul>
            `
        }
      </div>

      ${
        current.showAnnotations
          ? `<div class="makeover-annotation-list">
               <strong>🧠 認知設計專家批註：</strong>
               <ul style="margin:0.3rem 0 0;padding-left:1.15rem;">
                 ${data.annotations.map((a) => `<li>${a}</li>`).join('')}
               </ul>
             </div>`
          : ''
      }
    `;
  };

  container.addEventListener('click', (event) => {
    const tabBtn = event.target.closest('[data-makeover-tab]');
    if (tabBtn) {
      current = { ...current, view: tabBtn.getAttribute('data-makeover-tab') };
      ctx.setState(current);
      renderDom();
      return;
    }
    if (event.target.closest('[data-makeover-notes]')) {
      current = { ...current, showAnnotations: !current.showAnnotations };
      ctx.setState(current);
      renderDom();
    }
  });

  renderDom();
}

export const WIDGET_REGISTRY = {
  'cognitive-load-sim': renderCognitiveLoadSimulator,
  'slide-makeover': renderSlideMakeover,
};
