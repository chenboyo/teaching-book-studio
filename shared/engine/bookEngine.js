/**
 * Pure domain logic for Fluid Document-Slide teaching books.
 * Zero DOM dependencies — safe to test directly in Node.js and bundle via scripts/build.mjs.
 */

export const THEME_ORDER = ['paper', 'light', 'dark'];

export function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function countReadableUnits(text) {
  if (!text) return 0;
  const plain = String(text)
    .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi, (_, id, label) => label || id)
    .replace(/<[^>]+>/g, ' ');
  const cjkMatches = plain.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g) || [];
  const latinWords = plain
    .replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g, ' ')
    .match(/[A-Za-z0-9_.-]+/g) || [];
  return cjkMatches.length + latinWords.length;
}

export function estimateReadingMinutes(book) {
  if (!book || !Array.isArray(book.units) || book.units.length === 0) return 1;
  let totalUnits = 0;
  for (const unit of book.units) {
    totalUnits += countReadableUnits(unit.assertion);
    for (const p of unit.bookProse || []) {
      totalUnits += countReadableUnits(p);
    }
    for (const pt of unit.slidePoints || []) {
      totalUnits += countReadableUnits(pt);
    }
    totalUnits += countReadableUnits(unit.speakerNotes) * 0.5;
  }
  return Math.max(1, Math.round(totalUnits / 210));
}

export function buildGlossaryIndex(glossary) {
  const map = new Map();
  if (!Array.isArray(glossary)) return map;
  for (const item of glossary) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return map;
}

export function extractGlossaryRefs(text) {
  if (!text) return [];
  const refs = [];
  const regex = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;
  let match;
  while ((match = regex.exec(String(text))) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

export function renderGlossaryTokens(text, glossaryMap) {
  const raw = String(text ?? '');
  const tokenRegex = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;
  let out = '';
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(raw)) !== null) {
    out += escapeHtml(raw.slice(lastIndex, match.index));
    const termId = match[1];
    const customLabel = match[2];
    const entry = glossaryMap instanceof Map ? glossaryMap.get(termId) : null;
    if (entry) {
      const label = customLabel || entry.term;
      out += `<button type="button" class="glossary-chip" data-glossary-term="${escapeHtml(termId)}" title="點擊查看「${escapeHtml(entry.term)}」白話解釋">${escapeHtml(label)}</button>`;
    } else {
      out += escapeHtml(customLabel || termId);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  out += escapeHtml(raw.slice(lastIndex));
  return out;
}

export function normalizeBookData(rawBook) {
  const book = rawBook && typeof rawBook === 'object' ? rawBook : {};
  const units = Array.isArray(book.units) ? book.units : [];
  const glossary = Array.isArray(book.glossary) ? book.glossary : [];
  return {
    id: book.id || 'untitled-book',
    title: book.title || '未命名教材',
    subtitle: book.subtitle || '',
    category: book.category || '教學設計',
    audience: book.audience || '一般學習者',
    level: book.level || '入門',
    estimatedMinutes: book.estimatedMinutes || estimateReadingMinutes(book),
    learningObjectives: Array.isArray(book.learningObjectives) ? book.learningObjectives : [],
    glossary,
    units: units.map((u, idx) => ({
      ...u,
      id: u.id || `unit-${idx + 1}`,
      title: u.title || `單元 ${idx + 1}`,
      assertion: u.assertion || u.title || '',
      slidePoints: Array.isArray(u.slidePoints) ? u.slidePoints : [],
      bookProse: Array.isArray(u.bookProse) ? u.bookProse : [],
      durationSec: Number(u.durationSec) > 0 ? Number(u.durationSec) : 60,
    })),
  };
}

export function clampFontScale(scale) {
  const num = Number(scale);
  if (!Number.isFinite(num)) return 1;
  return Math.min(1.35, Math.max(0.85, Math.round(num * 100) / 100));
}

export function createViewerState({
  book,
  initialMode = 'book',
  initialUnitId = null,
  initialTheme = 'paper',
  initialFontScale = 1,
  initialNotesOpen = false,
  savedProgress = null,
} = {}) {
  const normalized = normalizeBookData(book);
  const unitCount = normalized.units.length;
  let currentIndex = 0;

  if (initialUnitId && unitCount > 0) {
    const idx = normalized.units.findIndex((u) => u.id === initialUnitId);
    if (idx >= 0) currentIndex = idx;
  } else if (savedProgress && Number.isInteger(savedProgress.lastUnitIndex) && unitCount > 0) {
    currentIndex = Math.max(0, Math.min(unitCount - 1, savedProgress.lastUnitIndex));
  }

  const completedUnitIds = new Set(
    Array.isArray(savedProgress?.completedUnitIds)
      ? savedProgress.completedUnitIds.filter((id) => normalized.units.some((u) => u.id === id))
      : []
  );

  if (unitCount > 0) {
    completedUnitIds.add(normalized.units[currentIndex].id);
  }

  const quizAnswers =
    savedProgress && savedProgress.quizAnswers && typeof savedProgress.quizAnswers === 'object'
      ? { ...savedProgress.quizAnswers }
      : {};

  const widgetStates =
    savedProgress && savedProgress.widgetStates && typeof savedProgress.widgetStates === 'object'
      ? { ...savedProgress.widgetStates }
      : {};

  return {
    bookId: normalized.id,
    unitIds: normalized.units.map((u) => u.id),
    quizUnitIds: normalized.units.filter((u) => u.quiz).map((u) => u.id),
    mode: initialMode === 'slide' ? 'slide' : 'book',
    currentIndex,
    theme: THEME_ORDER.includes(initialTheme) ? initialTheme : 'paper',
    fontScale: clampFontScale(initialFontScale),
    notesOpen: Boolean(initialNotesOpen),
    completedUnitIds: Array.from(completedUnitIds),
    quizAnswers,
    widgetStates,
  };
}

export function transitionViewerState(state, action) {
  if (!state || !action) return state;
  const total = state.unitIds.length;

  const markAt = (idx, existingCompleted) => {
    if (total === 0) return existingCompleted;
    const id = state.unitIds[idx];
    if (!id || existingCompleted.includes(id)) return existingCompleted;
    return [...existingCompleted, id];
  };

  switch (action.type) {
    case 'SET_MODE': {
      const nextMode = action.mode === 'slide' ? 'slide' : 'book';
      if (nextMode === state.mode) return state;
      return { ...state, mode: nextMode };
    }
    case 'TOGGLE_MODE': {
      return { ...state, mode: state.mode === 'slide' ? 'book' : 'slide' };
    }
    case 'GO_TO_UNIT': {
      if (total === 0) return state;
      const target = Math.max(0, Math.min(total - 1, Number(action.index) || 0));
      return {
        ...state,
        currentIndex: target,
        completedUnitIds: markAt(target, state.completedUnitIds),
      };
    }
    case 'GO_TO_UNIT_ID': {
      const idx = state.unitIds.indexOf(action.unitId);
      if (idx < 0) return state;
      return {
        ...state,
        currentIndex: idx,
        completedUnitIds: markAt(idx, state.completedUnitIds),
      };
    }
    case 'NEXT_UNIT': {
      if (total === 0 || state.currentIndex >= total - 1) return state;
      const target = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: target,
        completedUnitIds: markAt(target, state.completedUnitIds),
      };
    }
    case 'PREV_UNIT': {
      if (total === 0 || state.currentIndex <= 0) return state;
      const target = state.currentIndex - 1;
      return {
        ...state,
        currentIndex: target,
        completedUnitIds: markAt(target, state.completedUnitIds),
      };
    }
    case 'FIRST_UNIT': {
      if (total === 0) return state;
      return {
        ...state,
        currentIndex: 0,
        completedUnitIds: markAt(0, state.completedUnitIds),
      };
    }
    case 'LAST_UNIT': {
      if (total === 0) return state;
      const target = total - 1;
      return {
        ...state,
        currentIndex: target,
        completedUnitIds: markAt(target, state.completedUnitIds),
      };
    }
    case 'MARK_COMPLETED': {
      if (!action.unitId || !state.unitIds.includes(action.unitId)) return state;
      if (state.completedUnitIds.includes(action.unitId)) return state;
      return {
        ...state,
        completedUnitIds: [...state.completedUnitIds, action.unitId],
      };
    }
    case 'ANSWER_QUIZ': {
      if (!action.unitId) return state;
      return {
        ...state,
        quizAnswers: {
          ...state.quizAnswers,
          [action.unitId]: {
            optionIndex: Number(action.optionIndex),
            isCorrect: Boolean(action.isCorrect),
          },
        },
        completedUnitIds: state.completedUnitIds.includes(action.unitId)
          ? state.completedUnitIds
          : [...state.completedUnitIds, action.unitId],
      };
    }
    case 'SET_THEME': {
      if (!THEME_ORDER.includes(action.theme)) return state;
      return { ...state, theme: action.theme };
    }
    case 'CYCLE_THEME': {
      const idx = THEME_ORDER.indexOf(state.theme);
      const nextTheme = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      return { ...state, theme: nextTheme };
    }
    case 'SET_FONT_SCALE': {
      return { ...state, fontScale: clampFontScale(action.scale) };
    }
    case 'TOGGLE_NOTES': {
      const nextOpen =
        typeof action.open === 'boolean' ? action.open : !state.notesOpen;
      return { ...state, notesOpen: nextOpen };
    }
    case 'SET_WIDGET_STATE': {
      if (!action.widgetId || typeof action.patch !== 'object' || !action.patch) return state;
      const prevWidget = state.widgetStates[action.widgetId] || {};
      return {
        ...state,
        widgetStates: {
          ...state.widgetStates,
          [action.widgetId]: { ...prevWidget, ...action.patch },
        },
      };
    }
    default:
      return state;
  }
}

export function computeProgress(state) {
  const totalUnits = state?.unitIds?.length || 0;
  const completedCount = state?.completedUnitIds?.length || 0;
  const percentage = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;
  const quizUnitIds = state?.quizUnitIds || [];
  let quizCorrectCount = 0;
  for (const qId of quizUnitIds) {
    if (state.quizAnswers?.[qId]?.isCorrect) {
      quizCorrectCount++;
    }
  }
  return {
    completedCount,
    totalUnits,
    percentage,
    quizCorrectCount,
    totalQuizzes: quizUnitIds.length,
  };
}

export function serializeProgress(state) {
  return JSON.stringify({
    version: 1,
    bookId: state.bookId,
    lastUnitIndex: state.currentIndex,
    theme: state.theme,
    fontScale: state.fontScale,
    completedUnitIds: state.completedUnitIds,
    quizAnswers: state.quizAnswers,
    widgetStates: state.widgetStates,
  });
}

export function deserializeProgress(rawJson) {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      lastUnitIndex: Number.isInteger(parsed.lastUnitIndex) ? parsed.lastUnitIndex : 0,
      theme: THEME_ORDER.includes(parsed.theme) ? parsed.theme : 'paper',
      fontScale: clampFontScale(parsed.fontScale || 1),
      completedUnitIds: Array.isArray(parsed.completedUnitIds) ? parsed.completedUnitIds : [],
      quizAnswers: parsed.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {},
      widgetStates: parsed.widgetStates && typeof parsed.widgetStates === 'object' ? parsed.widgetStates : {},
    };
  } catch {
    return null;
  }
}
