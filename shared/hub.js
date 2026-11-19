import { BOOK_CATALOG } from './catalog.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readBookProgress(storageKey, unitCount) {
  if (!storageKey || !unitCount) return { completed: 0, pct: 0 };
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { completed: 0, pct: 0 };
    const parsed = JSON.parse(raw);
    const completed = Array.isArray(parsed?.completedUnitIds)
      ? parsed.completedUnitIds.length
      : 0;
    const pct = Math.min(100, Math.round((completed / unitCount) * 100));
    return { completed, pct };
  } catch {
    return { completed: 0, pct: 0 };
  }
}

function initHub() {
  const root = document.getElementById('hub-root');
  const announcer = document.getElementById('sr-announcer');
  if (!root) return;

  const state = {
    category: '全部',
    query: '',
  };

  const categories = ['全部', ...Array.from(new Set(BOOK_CATALOG.map((b) => b.category)))];

  const announce = (msg) => {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = msg;
    });
  };

  function getFilteredBooks() {
    const q = state.query.trim().toLowerCase();
    return BOOK_CATALOG.filter((book) => {
      if (state.category !== '全部' && book.category !== state.category) return false;
      if (!q) return true;
      const haystack = [
        book.title,
        book.subtitle,
        book.category,
        book.audience,
        book.level,
        book.description,
        ...(book.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderCardsOnly() {
    const gridHost = document.getElementById('hub-cards-host');
    if (!gridHost) return;
    const items = getFilteredBooks();
    if (items.length === 0) {
      gridHost.innerHTML = `<div class="hub-empty-state">找不到符合「${escapeHtml(state.query)}」的教學教材，請嘗試其他關鍵字或切換領域分類。</div>`;
      return;
    }

    gridHost.innerHTML = `
      <div class="hub-books-grid">
        ${items
          .map((book) => {
            const prog = readBookProgress(book.storageKey, book.unitCount || 0);
            const bookUrl = `${escapeHtml(book.entry)}?mode=book`;
            const slideUrl = `${escapeHtml(book.entry)}?mode=slide`;
            return `
              <article class="hub-book-card" style="--card-accent: ${escapeHtml(book.accent || '#1b365d')}">
                <div class="hub-card-top">
                  <span class="hub-card-icon" aria-hidden="true">${book.icon || '📖'}</span>
                  <div class="hub-card-badges">
                    <span class="hub-cat-badge">${escapeHtml(book.category)}</span>
                    <span class="hub-audience-badge">${escapeHtml(book.audience)}</span>
                  </div>
                </div>
                <h3 class="hub-card-title">${escapeHtml(book.title)}</h3>
                ${book.subtitle ? `<p class="hub-card-subtitle">${escapeHtml(book.subtitle)}</p>` : ''}
                <p class="hub-card-desc">${escapeHtml(book.description)}</p>
                <div class="hub-card-meta">
                  <span>📑 ${book.unitCount || 0} 個單元</span>
                  <span>⏱️ 約 ${book.estimatedMinutes || 5} 分鐘</span>
                  <span>🎯 ${escapeHtml(book.level || '入門')}</span>
                </div>
                <div class="hub-card-tags">
                  ${(book.tags || []).map((t) => `<span class="hub-tag">#${escapeHtml(t)}</span>`).join('')}
                </div>
                <div class="hub-progress-row" aria-label="學習進度">
                  <span>學習進度 ${prog.pct}%</span>
                  <div class="hub-progress-track">
                    <div class="hub-progress-fill" style="width:${prog.pct}%"></div>
                  </div>
                </div>
                <div class="hub-card-footer">
                  <a class="action-link action-link--book" href="${bookUrl}">📖 閱讀教材</a>
                  <a class="action-link action-link--slide" href="${slideUrl}">📽️ 簡報展示</a>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function renderFull() {
    const totalUnits = BOOK_CATALOG.reduce((sum, b) => sum + (b.unitCount || 0), 0);
    const totalCompleted = BOOK_CATALOG.reduce(
      (sum, b) => sum + readBookProgress(b.storageKey, b.unitCount || 0).completed,
      0
    );

    root.innerHTML = `
      <section class="hub-hero" aria-labelledby="hub-welcome-title">
        <div class="hub-hero-text">
          <h2 id="hub-welcome-title">📚 一份教材來源，同時享受「深度閱讀」與「專業簡報」</h2>
          <p>每本教材遵循認知負荷理論、Mayer 多媒體原則與斷言-視覺證據結構設計；免安裝伺服器，支援主題切換、講者備忘錄與雙版型講義列印。</p>
        </div>
        <div class="hub-stats-pill">
          📖 已收錄 ${BOOK_CATALOG.length} 本教材 ｜ 📑 共 ${totalUnits} 單元（已讀 ${totalCompleted}）
        </div>
      </section>

      <div class="hub-toolbar">
        <div class="hub-filters" role="group" aria-label="依領域篩選教材">
          ${categories
            .map(
              (cat) => `
            <button type="button"
              class="pill-btn ${state.category === cat ? 'is-active' : ''}"
              data-hub-category="${escapeHtml(cat)}"
              aria-pressed="${state.category === cat}">
              ${escapeHtml(cat)}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="hub-search-box">
          <label class="visually-hidden" for="hub-search">搜尋教學教材或簡報</label>
          <input id="hub-search" type="search" class="hub-search-input" placeholder="🔍 搜尋書名、概念、對象或標籤…" value="${escapeHtml(state.query)}" />
        </div>
      </div>

      <div id="hub-cards-host" class="hub-grid-container"></div>

      <aside class="hub-author-tip" aria-label="新增教學教材開發說明">
        <strong>🛠️ 新增一本教學教材與簡報：</strong> 在專案根目錄執行 <code>npm run new-book -- &lt;slug&gt; "教材名稱" "分類" "目標對象"</code>，即可自動建立合規骨架並進行 <code>npm run audit-books</code> 教學品管稽核！
      </aside>
    `;

    renderCardsOnly();
  }

  root.addEventListener('click', (e) => {
    const catBtn = e.target.closest('[data-hub-category]');
    if (!catBtn) return;
    state.category = catBtn.getAttribute('data-hub-category');
    renderFull();
    announce(`已篩選分類：${state.category}，共 ${getFilteredBooks().length} 本教材`);
  });

  root.addEventListener('input', (e) => {
    if (e.target.id === 'hub-search') {
      state.query = e.target.value;
      renderCardsOnly();
    }
  });

  renderFull();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHub);
} else {
  initHub();
}
