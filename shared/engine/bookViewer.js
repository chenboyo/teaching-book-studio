import {
  buildGlossaryIndex,
  computeProgress,
  createViewerState,
  deserializeProgress,
  escapeHtml,
  normalizeBookData,
  renderGlossaryTokens,
  serializeProgress,
  transitionViewerState,
} from './bookEngine.js';
import { closeTopLayer, setupAccessibleDialogs } from '../ui/dialogHelper.js';
import { setupAccessibleToolbars } from '../ui/toolbarHelper.js';

const THEME_LABELS = {
  paper: '溫潤紙本',
  light: '明亮白底',
  dark: '深色護眼',
};

function formatClock(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function mountBookViewer({ book, widgets = {}, rootSelector = '#book-app' }) {
  const appRoot = document.querySelector(rootSelector);
  if (!appRoot) return null;

  const normalized = normalizeBookData(book);
  const glossaryMap = buildGlossaryIndex(normalized.glossary);
  const storageKey = `book_${normalized.id}_progress_v1`;

  let saved = null;
  try {
    saved = deserializeProgress(window.localStorage.getItem(storageKey));
  } catch {
    saved = null;
  }

  let initialMode = 'book';
  let initialUnitId = null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'slide') initialMode = 'slide';
    if (params.get('mode') === 'book') initialMode = 'book';
    if (window.location.hash && window.location.hash.length > 1) {
      initialUnitId = decodeURIComponent(window.location.hash.slice(1));
    }
  } catch {
    // Ignore URL parsing errors on restricted offline contexts
  }

  let state = createViewerState({
    book: normalized,
    initialMode,
    initialUnitId,
    initialTheme: saved?.theme || 'paper',
    initialFontScale: saved?.fontScale || 1,
    initialNotesOpen: initialMode === 'slide',
    savedProgress: saved,
  });

  // Pacing timer state (live presenter clock)
  let timerRunning = false;
  let timerSeconds = 0;
  let timerIntervalId = null;

  const announcer = document.getElementById('sr-announcer');
  const announce = (msg) => {
    if (!announcer || !msg) return;
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = msg;
    });
  };

  const persistState = () => {
    try {
      window.localStorage.setItem(storageKey, serializeProgress(state));
    } catch {
      // Safe no-op if storage is unavailable
    }
    try {
      const unitId = state.unitIds[state.currentIndex];
      if (unitId && window.location.protocol !== 'file:') {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', state.mode);
        url.hash = unitId;
        window.history.replaceState(null, '', url.toString());
      } else if (unitId) {
        window.history.replaceState(null, '', `#${unitId}`);
      }
    } catch {
      // Safe no-op on file:// origins that disallow replaceState
    }
  };

  const applyThemeAndScale = () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.style.setProperty('--reader-font-scale', String(state.fontScale));
    document.body.setAttribute('data-view-mode', state.mode);
    if (!document.body.getAttribute('data-print-mode')) {
      document.body.setAttribute('data-print-mode', state.mode === 'slide' ? 'handout' : 'book');
    }
  };

  const navigateWithTransition = (updateDOM, direction) => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition({
          update: updateDOM,
          types: [direction],
        });
        return;
      } catch {
        // Fallback when browser supports callback-only startViewTransition
      }
    }
    updateDOM();
  };

  function renderVisualBlock(unit, { compact = false } = {}) {
    const parts = [];
    if (unit.widgetId) {
      parts.push(
        `<div class="widget-host" data-widget-id="${escapeHtml(unit.widgetId)}" data-unit-id="${escapeHtml(unit.id)}"></div>`
      );
    }
    if (unit.visual && unit.visual.svg) {
      parts.push(`
        <figure class="unit-visual-figure">
          ${unit.visual.svg}
          ${unit.visual.caption ? `<figcaption>${escapeHtml(unit.visual.caption)}</figcaption>` : ''}
        </figure>
      `);
    }
    if (unit.comparison) {
      const bad = unit.comparison.before || {};
      const good = unit.comparison.after || {};
      parts.push(`
        <div class="comparison-grid">
          <div class="comparison-panel comparison-panel--bad">
            <h4>❌ ${escapeHtml(bad.title || '傳統作法')}</h4>
            <ul>${(bad.points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>
          <div class="comparison-panel comparison-panel--good">
            <h4>✅ ${escapeHtml(good.title || '推薦作法')}</h4>
            <ul>${(good.points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>
        </div>
      `);
    }
    if (Array.isArray(unit.glossaryFocusIds) && unit.glossaryFocusIds.length > 0) {
      parts.push(`
        <div class="glossary-grid">
          ${unit.glossaryFocusIds
            .map((gId) => {
              const entry = glossaryMap.get(gId);
              if (!entry) return '';
              return `
                <div class="glossary-card">
                  <div class="glossary-term-title">${escapeHtml(entry.term)} <small>(${escapeHtml(entry.en || '')})</small></div>
                  <div>${escapeHtml(entry.definition)}</div>
                  ${entry.analogy ? `<div style="margin-top:0.35rem;color:var(--ink-secondary);font-size:0.9rem;">💡 <strong>生活比喻：</strong>${escapeHtml(entry.analogy)}</div>` : ''}
                </div>
              `;
            })
            .join('')}
        </div>
      `);
    }
    if (Array.isArray(unit.checklist) && unit.checklist.length > 0 && !compact) {
      parts.push(`
        <div class="unit-callout unit-callout--example">
          <div class="unit-callout-title">✅ 交付前行動檢查清單</div>
          <ul style="margin:0.35rem 0 0;padding-left:1.2rem;">
            ${unit.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    return parts.join('');
  }

  function renderQuizBlock(unit) {
    if (!unit.quiz) return '';
    const q = unit.quiz;
    const savedAnswer = state.quizAnswers[unit.id];
    const selectedIdx = savedAnswer ? savedAnswer.optionIndex : null;
    const chosenOpt = selectedIdx !== null ? q.options[selectedIdx] : null;
    const isCorrect = savedAnswer ? savedAnswer.isCorrect : false;

    return `
      <section class="quiz-box" aria-label="隨堂觀念檢測">
        <div class="quiz-question">🧩 隨堂動腦：${escapeHtml(q.question)}</div>
        <div class="quiz-options">
          ${q.options
            .map((opt, idx) => {
              let cls = 'quiz-option-btn';
              if (selectedIdx === idx) {
                cls += idx === q.correctIndex ? ' is-correct' : ' is-wrong';
              }
              return `
                <button type="button"
                  class="${cls}"
                  data-quiz-unit="${escapeHtml(unit.id)}"
                  data-quiz-option="${idx}"
                  aria-pressed="${selectedIdx === idx ? 'true' : 'false'}">
                  ${String.fromCharCode(65 + idx)}. ${escapeHtml(opt.text)}
                </button>
              `;
            })
            .join('')}
        </div>
        ${
          chosenOpt
            ? `<div class="quiz-feedback ${isCorrect ? 'is-ok' : 'is-err'}" role="status">
                 ${isCorrect ? '🎉 答對了！' : '💡 再想一下：'}${escapeHtml(chosenOpt.explanation)}
               </div>`
            : ''
        }
      </section>
    `;
  }

  function renderToolbarHtml() {
    return `
      <div class="reader-toolbar-wrap no-print">
        <div id="reader-toolbar" class="reader-toolbar" role="toolbar" focusgroup="toolbar wrap" aria-label="教材與簡報控制列">
          <div role="group" aria-label="模式切換" class="toolbar-group">
            <button type="button" class="pill-btn" data-action="mode-book" aria-pressed="${state.mode === 'book' ? 'true' : 'false'}">📖 教材閱讀</button>
            <button type="button" class="pill-btn" data-action="mode-slide" aria-pressed="${state.mode === 'slide' ? 'true' : 'false'}">📽️ 簡報展示</button>
          </div>
          <span role="separator" aria-orientation="vertical" class="toolbar-separator"></span>
          <div role="group" aria-label="簡報輔助" class="toolbar-group">
            <button type="button" class="tool-btn" data-action="open-overview" title="開啟章節總覽網格 (G)">🗂️ 總覽</button>
            <button type="button" class="tool-btn" data-action="toggle-notes" aria-pressed="${state.notesOpen ? 'true' : 'false'}" title="顯示或隱藏講者備忘錄 (N)">🗒️ 講稿</button>
            <button type="button" class="tool-btn" data-action="open-glossary" title="開啟核心專有名詞庫 (D)">📚 詞彙</button>
          </div>
          <span role="separator" aria-orientation="vertical" class="toolbar-separator"></span>
          <div role="group" aria-label="閱讀外觀與輸出" class="toolbar-group">
            <button type="button" class="tool-btn" data-action="font-down" aria-label="縮小字體" title="縮小字體">A-</button>
            <button type="button" class="tool-btn" data-action="font-up" aria-label="放大字體" title="放大字體">A+</button>
            <button type="button" class="tool-btn" data-action="cycle-theme" title="切換閱讀主題 (T)">🎨 ${escapeHtml(THEME_LABELS[state.theme])}</button>
            <button type="button" class="tool-btn" data-action="open-print" title="列印教材或簡報講義 (P)">🖨️ 列印</button>
            <button type="button" class="tool-btn" data-action="open-shortcuts" aria-label="鍵盤快捷鍵說明" title="快捷鍵說明 (?)">⌨️</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderBookModeHtml(progress) {
    const currentUnitId = state.unitIds[state.currentIndex];
    const tocHtml = `
      <aside class="toc-sidebar" aria-label="教材目錄">
        <div class="toc-heading">
          <span>📑 章節目錄</span>
          <span style="font-size:0.8rem;color:var(--accent-primary);">${progress.completedCount}/${progress.totalUnits}</span>
        </div>
        <ul class="toc-list">
          ${normalized.units
            .map((unit, idx) => {
              const isCurrent = unit.id === currentUnitId;
              const isDone = state.completedUnitIds.includes(unit.id);
              return `
                <li>
                  <button type="button"
                    class="toc-item-btn ${isCurrent ? 'is-current' : ''}"
                    data-go-unit="${idx}">
                    <span class="toc-item-num">${String(idx + 1).padStart(2, '0')}</span>
                    <span>${escapeHtml(unit.title)}</span>
                    ${isDone ? '<span class="toc-item-check" aria-label="已閱讀">✓</span>' : ''}
                  </button>
                </li>
              `;
            })
            .join('')}
        </ul>
      </aside>
    `;

    const coverHtml = `
      <section class="book-cover-card" aria-labelledby="book-cover-title">
        <div class="unit-kicker-row">
          <div class="unit-badge-group">
            <span class="unit-num-pill">${escapeHtml(normalized.category)}</span>
            <span class="unit-tag-pill">👥 ${escapeHtml(normalized.audience)}</span>
            <span class="unit-tag-pill">⏱️ 約 ${normalized.estimatedMinutes} 分鐘</span>
          </div>
          <span class="unit-tag-pill">📊 進度 ${progress.percentage}%${progress.totalQuizzes > 0 ? `・測驗 ${progress.quizCorrectCount}/${progress.totalQuizzes}` : ''}</span>
        </div>
        <h2 id="book-cover-title" style="font-family:var(--font-display);margin-bottom:0.35rem;">${escapeHtml(normalized.title)}</h2>
        ${normalized.subtitle ? `<p style="margin:0;color:var(--ink-secondary);font-weight:700;">${escapeHtml(normalized.subtitle)}</p>` : ''}
        ${
          normalized.learningObjectives.length > 0
            ? `<div style="margin-top:0.85rem;">
                 <strong>🎯 本教材學習目標：</strong>
                 <ul class="book-objectives-list">
                   ${normalized.learningObjectives.map((obj) => `<li>${escapeHtml(obj)}</li>`).join('')}
                 </ul>
               </div>`
            : ''
        }
      </section>
    `;

    const unitsHtml = normalized.units
      .map((unit, idx) => {
        const isCurrent = idx === state.currentIndex;
        const isDone = state.completedUnitIds.includes(unit.id);
        const calloutType = unit.callout?.type || 'tip';
        return `
          <article id="unit-${escapeHtml(unit.id)}" class="unit-article ${isCurrent ? 'is-current' : ''}" data-unit-index="${idx}">
            <div class="unit-kicker-row">
              <div class="unit-badge-group">
                <span class="unit-num-pill">單元 ${idx + 1} / ${normalized.units.length}</span>
                ${unit.tag ? `<span class="unit-tag-pill">${escapeHtml(unit.tag)}</span>` : ''}
                <span class="unit-tag-pill">${escapeHtml(unit.title)}</span>
              </div>
              <button type="button" class="tool-btn" data-present-unit="${idx}" title="直接以簡報模式投影本單元">📽️ 從此頁簡報</button>
            </div>

            <h3 class="unit-assertion">${renderGlossaryTokens(unit.assertion, glossaryMap)}</h3>

            ${renderVisualBlock(unit)}

            <div class="unit-prose">
              ${unit.bookProse.map((p) => `<p>${renderGlossaryTokens(p, glossaryMap)}</p>`).join('')}
            </div>

            ${
              unit.callout && unit.callout.text
                ? `<aside class="unit-callout unit-callout--${escapeHtml(calloutType)}">
                     <div class="unit-callout-title">${escapeHtml(unit.callout.title || '重點提醒')}</div>
                     <div>${renderGlossaryTokens(unit.callout.text, glossaryMap)}</div>
                   </aside>`
                : ''
            }

            ${renderQuizBlock(unit)}

            ${
              state.notesOpen && unit.speakerNotes
                ? `<aside class="inline-notes-box">
                     <strong>🗒️ 講者備忘錄（建議約 ${unit.durationSec} 秒）：</strong>
                     ${escapeHtml(unit.speakerNotes)}
                   </aside>`
                : ''
            }

            <div class="unit-actions-footer">
              <span style="font-size:0.84rem;color:var(--ink-secondary);font-weight:700;">
                ${isDone ? '✅ 已記錄閱讀進度' : '⏳ 尚未標記完成'}
              </span>
              <button type="button" class="pill-btn ${isDone ? 'is-active' : ''}" data-mark-done="${escapeHtml(unit.id)}">
                ${isDone ? '✓ 已讀完本單元' : '標記本單元已讀'}
              </button>
            </div>
          </article>
        `;
      })
      .join('');

    return `
      <div class="book-layout">
        ${tocHtml}
        <div class="book-reading-column">
          ${coverHtml}
          ${unitsHtml}
        </div>
      </div>
    `;
  }

  function renderSlideModeHtml(progress) {
    const total = normalized.units.length;
    const unit = normalized.units[state.currentIndex];
    if (!unit) return '<p>尚無投影片單元。</p>';
    const isFirst = state.currentIndex <= 0;
    const isLast = state.currentIndex >= total - 1;
    const hasVisual = Boolean(
      (unit.visual && unit.visual.svg) ||
      unit.widgetId ||
      unit.comparison ||
      (Array.isArray(unit.glossaryFocusIds) && unit.glossaryFocusIds.length > 0) ||
      unit.quiz
    );

    return `
      <div class="slide-workspace">
        <section class="slide-stage" aria-live="polite" aria-label="簡報展示舞台">
          <div>
            <div class="slide-header-meta">
              <span>${escapeHtml(normalized.title)}・${escapeHtml(unit.tag || unit.title)}</span>
              <span>投影片 ${state.currentIndex + 1} / ${total}</span>
            </div>
            <h2 class="slide-assertion">${renderGlossaryTokens(unit.assertion, glossaryMap)}</h2>
          </div>

          <div class="slide-body-grid ${!hasVisual || unit.slidePoints.length === 0 ? 'is-single' : ''}">
            ${
              hasVisual
                ? `<div>
                     ${renderVisualBlock(unit, { compact: true })}
                     ${unit.quiz ? renderQuizBlock(unit) : ''}
                   </div>`
                : ''
            }
            ${
              unit.slidePoints.length > 0
                ? `<div class="slide-points-panel">
                     <ul class="slide-points-list">
                       ${unit.slidePoints.map((pt) => `<li>${renderGlossaryTokens(pt, glossaryMap)}</li>`).join('')}
                     </ul>
                   </div>`
                : ''
            }
          </div>

          <div class="slide-header-meta" style="border-top:1px solid var(--border-soft);padding-top:0.55rem;">
            <span>💡 提示：方向鍵 ← / → 換頁・G 總覽・N 講者備忘錄・B 返回教材閱讀</span>
            <span>進度 ${progress.percentage}%</span>
          </div>
        </section>

        <div class="slide-rail" role="toolbar" focusgroup="toolbar wrap" aria-label="簡報換頁控制列">
          <button type="button" class="pill-btn" data-action="prev-slide" aria-disabled="${isFirst ? 'true' : 'false'}">← 上一頁</button>
          <span class="slide-counter">第 ${state.currentIndex + 1} / ${total} 頁（${escapeHtml(unit.title)}）</span>
          <button type="button" class="pill-btn" data-action="next-slide" aria-disabled="${isLast ? 'true' : 'false'}">下一頁 →</button>
        </div>

        ${
          state.notesOpen
            ? `<aside class="notes-drawer" aria-label="講者備忘錄與計時器">
                 <div class="notes-drawer-header">
                   <strong>🗒️ 講者備忘錄（本頁建議 ${unit.durationSec} 秒）</strong>
                   <div class="timer-cluster">
                     <span id="presenter-clock-display">⏱️ ${formatClock(timerSeconds)}</span>
                     <button type="button" class="tool-btn" data-action="timer-toggle">${timerRunning ? '⏸ 暫停' : '▶ 計時'}</button>
                     <button type="button" class="tool-btn" data-action="timer-reset">↺ 歸零</button>
                   </div>
                 </div>
                 <p style="margin:0;line-height:1.7;">${escapeHtml(unit.speakerNotes || '本頁尚無補充講稿。')}</p>
               </aside>`
            : ''
        }
      </div>
    `;
  }

  function renderPrintHandoutHtml() {
    return `
      <div class="print-handout-container" aria-hidden="true">
        <header style="border-bottom:2px solid #1b365d;padding-bottom:0.6rem;margin-bottom:1rem;">
          <h1 style="margin:0;font-size:1.5rem;">${escapeHtml(normalized.title)} — 簡報與講者講義</h1>
          <p style="margin:0.25rem 0 0;color:#475569;">${escapeHtml(normalized.subtitle)}</p>
        </header>
        ${normalized.units
          .map(
            (unit, idx) => `
          <section class="handout-sheet">
            <div style="font-size:0.82rem;color:#475569;font-weight:700;">第 ${idx + 1} / ${normalized.units.length} 頁・${escapeHtml(unit.tag || unit.title)}</div>
            <h2 style="margin:0.25rem 0 0.7rem;font-size:1.22rem;">${escapeHtml(unit.assertion)}</h2>
            ${unit.visual && unit.visual.svg ? `<div>${unit.visual.svg}</div>` : ''}
            ${
              unit.slidePoints.length > 0
                ? `<ul style="margin:0.5rem 0;">${unit.slidePoints.map((pt) => `<li>${escapeHtml(pt)}</li>`).join('')}</ul>`
                : ''
            }
            <div class="handout-notes">
              <strong>🗒️ 講者筆記與補充說明（約 ${unit.durationSec} 秒）：</strong>
              <div>${escapeHtml(unit.speakerNotes || '')}</div>
            </div>
          </section>
        `
          )
          .join('')}
      </div>
    `;
  }

  function hydrateWidgets() {
    const hosts = Array.from(appRoot.querySelectorAll('[data-widget-id]'));
    for (const host of hosts) {
      const widgetId = host.getAttribute('data-widget-id');
      const fn = widgets[widgetId];
      if (typeof fn !== 'function') {
        host.innerHTML = `<p style="margin:0;color:var(--ink-secondary);">互動元件 <code>${escapeHtml(widgetId)}</code> 尚未載入。</p>`;
        continue;
      }
      fn(host, {
        state: state.widgetStates[widgetId] || {},
        getState: () => state.widgetStates[widgetId] || {},
        setState: (patch, { rerender = false } = {}) => {
          state = transitionViewerState(state, { type: 'SET_WIDGET_STATE', widgetId, patch });
          persistState();
          if (rerender) render();
        },
        mode: state.mode,
        announce,
      });
    }
  }

  function populateOverviewDialog() {
    const body = document.getElementById('overview-dialog-body');
    if (!body) return;
    body.innerHTML = `
      <div class="overview-grid">
        ${normalized.units
          .map((unit, idx) => {
            const isCurrent = idx === state.currentIndex;
            const isDone = state.completedUnitIds.includes(unit.id);
            return `
              <button type="button" class="overview-card ${isCurrent ? 'is-current' : ''}" data-overview-unit="${idx}">
                <div style="display:flex;justify-content:space-between;width:100%;font-size:0.78rem;font-weight:800;color:var(--ink-secondary);">
                  <span>#${idx + 1}・${escapeHtml(unit.tag || unit.title)}</span>
                  <span>${isDone ? '✓' : ''}</span>
                </div>
                <strong style="font-size:0.95rem;line-height:1.4;">${escapeHtml(unit.assertion)}</strong>
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function populateGlossaryDialog(focusTermId = null) {
    const body = document.getElementById('glossary-dialog-body');
    if (!body) return;
    body.innerHTML = `
      <div class="glossary-grid">
        ${normalized.glossary
          .map((item) => {
            const isFocused = focusTermId && item.id === focusTermId;
            return `
              <article class="glossary-card ${isFocused ? 'is-focused' : ''}" id="glossary-entry-${escapeHtml(item.id)}">
                <div class="glossary-term-title">${escapeHtml(item.term)} <small style="color:var(--ink-secondary);">(${escapeHtml(item.en || '')})</small></div>
                <p style="margin:0 0 0.35rem;">${escapeHtml(item.definition)}</p>
                ${item.analogy ? `<p style="margin:0;font-size:0.9rem;color:var(--ink-secondary);">💡 <strong>生活比喻：</strong>${escapeHtml(item.analogy)}</p>` : ''}
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function openDialogById(id) {
    const dlg = document.getElementById(id);
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
  }

  function closeDialogById(id) {
    const dlg = document.getElementById(id);
    if (dlg && dlg.open) {
      closeTopLayer(dlg);
    }
  }

  function render() {
    applyThemeAndScale();
    const progress = computeProgress(state);

    appRoot.innerHTML = `
      ${renderToolbarHtml()}
      <div class="top-progress-bar no-print" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percentage}" aria-label="閱讀進度">
        <div class="top-progress-fill" style="width:${progress.percentage}%"></div>
      </div>
      <div style="margin-top:0.9rem;">
        ${state.mode === 'slide' ? renderSlideModeHtml(progress) : renderBookModeHtml(progress)}
      </div>
      ${renderPrintHandoutHtml()}
    `;

    setupAccessibleToolbars(appRoot);
    hydrateWidgets();
    persistState();
  }

  function goToUnitWithFeedback(nextIndex, { scrollInBook = true } = {}) {
    const prevIdx = state.currentIndex;
    const direction = nextIndex >= prevIdx ? 'forward' : 'backward';
    const apply = () => {
      state = transitionViewerState(state, { type: 'GO_TO_UNIT', index: nextIndex });
      render();
      const unit = normalized.units[state.currentIndex];
      if (unit) {
        announce(`已切換至單元 ${state.currentIndex + 1}：${unit.title}`);
        if (state.mode === 'book' && scrollInBook) {
          document.getElementById(`unit-${unit.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    if (state.mode === 'slide') {
      navigateWithTransition(apply, direction);
    } else {
      apply();
    }
  }

  function handleAction(action) {
    switch (action) {
      case 'mode-book':
        state = transitionViewerState(state, { type: 'SET_MODE', mode: 'book' });
        render();
        announce('已切換為教材閱讀模式');
        break;
      case 'mode-slide':
        state = transitionViewerState(state, { type: 'SET_MODE', mode: 'slide' });
        render();
        announce('已切換為簡報展示模式');
        break;
      case 'prev-slide':
        if (state.currentIndex > 0) goToUnitWithFeedback(state.currentIndex - 1);
        break;
      case 'next-slide':
        if (state.currentIndex < normalized.units.length - 1) goToUnitWithFeedback(state.currentIndex + 1);
        break;
      case 'open-overview':
        populateOverviewDialog();
        openDialogById('overview-dialog');
        break;
      case 'toggle-notes':
        state = transitionViewerState(state, { type: 'TOGGLE_NOTES' });
        render();
        announce(state.notesOpen ? '已開啟講者備忘錄' : '已隱藏講者備忘錄');
        break;
      case 'open-glossary':
        populateGlossaryDialog(null);
        openDialogById('glossary-dialog');
        break;
      case 'font-down':
        state = transitionViewerState(state, { type: 'SET_FONT_SCALE', scale: state.fontScale - 0.08 });
        render();
        announce(`字體縮放為 ${Math.round(state.fontScale * 100)}%`);
        break;
      case 'font-up':
        state = transitionViewerState(state, { type: 'SET_FONT_SCALE', scale: state.fontScale + 0.08 });
        render();
        announce(`字體縮放為 ${Math.round(state.fontScale * 100)}%`);
        break;
      case 'cycle-theme':
        state = transitionViewerState(state, { type: 'CYCLE_THEME' });
        render();
        announce(`已切換閱讀主題：${THEME_LABELS[state.theme]}`);
        break;
      case 'open-print':
        openDialogById('print-dialog');
        break;
      case 'open-shortcuts':
        openDialogById('shortcuts-dialog');
        break;
      case 'timer-toggle': {
        timerRunning = !timerRunning;
        if (timerRunning) {
          timerIntervalId = window.setInterval(() => {
            timerSeconds += 1;
            const clockEl = document.getElementById('presenter-clock-display');
            if (clockEl) clockEl.textContent = `⏱️ ${formatClock(timerSeconds)}`;
          }, 1000);
        } else if (timerIntervalId) {
          clearInterval(timerIntervalId);
          timerIntervalId = null;
        }
        render();
        break;
      }
      case 'timer-reset':
        timerRunning = false;
        timerSeconds = 0;
        if (timerIntervalId) {
          clearInterval(timerIntervalId);
          timerIntervalId = null;
        }
        render();
        break;
      default:
        break;
    }
  }

  // Event delegation on appRoot
  appRoot.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (actionBtn) {
      if (actionBtn.getAttribute('aria-disabled') === 'true') return;
      handleAction(actionBtn.getAttribute('data-action'));
      return;
    }

    const goBtn = event.target.closest('[data-go-unit]');
    if (goBtn) {
      goToUnitWithFeedback(Number(goBtn.getAttribute('data-go-unit')));
      return;
    }

    const presentBtn = event.target.closest('[data-present-unit]');
    if (presentBtn) {
      const idx = Number(presentBtn.getAttribute('data-present-unit'));
      state = transitionViewerState(state, { type: 'GO_TO_UNIT', index: idx });
      state = transitionViewerState(state, { type: 'SET_MODE', mode: 'slide' });
      render();
      announce(`已切換為簡報模式，第 ${idx + 1} 頁`);
      return;
    }

    const markBtn = event.target.closest('[data-mark-done]');
    if (markBtn) {
      const unitId = markBtn.getAttribute('data-mark-done');
      state = transitionViewerState(state, { type: 'MARK_COMPLETED', unitId });
      render();
      announce('已標記本單元為完成閱讀');
      return;
    }

    const quizBtn = event.target.closest('[data-quiz-unit]');
    if (quizBtn) {
      const unitId = quizBtn.getAttribute('data-quiz-unit');
      const optionIndex = Number(quizBtn.getAttribute('data-quiz-option'));
      const unit = normalized.units.find((u) => u.id === unitId);
      if (!unit?.quiz) return;
      const isCorrect = optionIndex === unit.quiz.correctIndex;
      state = transitionViewerState(state, {
        type: 'ANSWER_QUIZ',
        unitId,
        optionIndex,
        isCorrect,
      });
      render();
      announce(isCorrect ? '隨堂測驗答對了！' : '已顯示觀念診斷說明');
      return;
    }

    const chip = event.target.closest('[data-glossary-term]');
    if (chip) {
      const termId = chip.getAttribute('data-glossary-term');
      populateGlossaryDialog(termId);
      openDialogById('glossary-dialog');
      requestAnimationFrame(() => {
        document.getElementById(`glossary-entry-${termId}`)?.scrollIntoView({ block: 'nearest' });
      });
    }
  });

  // Dialog click handlers
  document.getElementById('overview-dialog')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-overview-unit]');
    if (!card) return;
    const idx = Number(card.getAttribute('data-overview-unit'));
    closeDialogById('overview-dialog');
    goToUnitWithFeedback(idx);
  });

  document.getElementById('print-dialog')?.addEventListener('click', (event) => {
    const printBtn = event.target.closest('[data-print-choice]');
    if (!printBtn) return;
    const mode = printBtn.getAttribute('data-print-choice');
    document.body.setAttribute('data-print-mode', mode === 'handout' ? 'handout' : 'book');
    closeDialogById('print-dialog');
    setTimeout(() => {
      window.print();
    }, 80);
  });

  // Touch swipe navigation on Slide Stage (safely ignores interactive controls)
  let swipeStartX = null;
  let swipeStartY = null;
  appRoot.addEventListener('pointerdown', (event) => {
    if (state.mode !== 'slide') return;
    if (event.target.closest('button, input, select, textarea, a, .widget-host')) return;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  });
  appRoot.addEventListener('pointerup', (event) => {
    if (state.mode !== 'slide' || swipeStartX === null || swipeStartY === null) return;
    const dx = event.clientX - swipeStartX;
    const dy = event.clientY - swipeStartY;
    swipeStartX = null;
    swipeStartY = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0 && state.currentIndex < normalized.units.length - 1) {
        goToUnitWithFeedback(state.currentIndex + 1);
      } else if (dx > 0 && state.currentIndex > 0) {
        goToUnitWithFeedback(state.currentIndex - 1);
      }
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.querySelector('dialog[open]')) return;

    const k = event.key.toLowerCase();
    if (k === 'b') {
      event.preventDefault();
      handleAction(state.mode === 'slide' ? 'mode-book' : 'mode-slide');
      return;
    }
    if (k === 'g') {
      event.preventDefault();
      handleAction('open-overview');
      return;
    }
    if (k === 'n') {
      event.preventDefault();
      handleAction('toggle-notes');
      return;
    }
    if (k === 'd') {
      event.preventDefault();
      handleAction('open-glossary');
      return;
    }
    if (k === 't') {
      event.preventDefault();
      handleAction('cycle-theme');
      return;
    }
    if (k === 'p') {
      event.preventDefault();
      handleAction('open-print');
      return;
    }
    if (event.key === '?') {
      event.preventDefault();
      handleAction('open-shortcuts');
      return;
    }

    if (state.mode === 'slide') {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || (event.key === ' ' && tag !== 'BUTTON' && tag !== 'A')) {
        if (!document.activeElement?.closest('[role="toolbar"]')) {
          event.preventDefault();
          handleAction('next-slide');
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        if (!document.activeElement?.closest('[role="toolbar"]')) {
          event.preventDefault();
          handleAction('prev-slide');
        }
      } else if (event.key === 'Home') {
        if (!document.activeElement?.closest('[role="toolbar"]')) {
          event.preventDefault();
          goToUnitWithFeedback(0);
        }
      } else if (event.key === 'End') {
        if (!document.activeElement?.closest('[role="toolbar"]')) {
          event.preventDefault();
          goToUnitWithFeedback(normalized.units.length - 1);
        }
      }
    }
  });

  setupAccessibleDialogs('dialog.lab-dialog');
  render();

  return {
    getState: () => state,
    destroy: () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    },
  };
}
