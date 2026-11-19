import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGlossaryIndex,
  computeProgress,
  countReadableUnits,
  createViewerState,
  deserializeProgress,
  escapeHtml,
  estimateReadingMinutes,
  renderGlossaryTokens,
  serializeProgress,
  THEME_ORDER,
  transitionViewerState,
} from '../engine/bookEngine.js';
import { lintBook } from '../engine/pedagogyLinter.js';

function makeRng(seed = 20261120) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeSampleBook() {
  return {
    id: 'sample-book',
    title: '示範雙模教學手冊',
    learningObjectives: ['理解核心名詞與比喻', '分辨好壞簡報差異'],
    glossary: [
      { id: 'chunk', term: '資訊組塊', definition: '打包後方便記憶的單元。', analogy: '把散落零件裝進盒子。' },
      { id: 'signal', term: '重點訊號', definition: '凸顯重點的視覺標記。', analogy: '螢光筆劃線。' },
    ],
    units: [
      {
        id: 'u1',
        title: '組塊概念',
        assertion: '把零散資訊打包成 [[chunk]] 能讓工作記憶容量翻倍',
        slidePoints: ['大腦一次只能握住四個盒子', '用 [[signal]] 引導第一眼視線'],
        bookProse: ['我們每天都會遇到大量新資訊，運用 [[chunk]] 與 [[signal]] 才能不被淹沒。'],
        visual: { svg: '<svg viewBox="0 0 100 40"></svg>' },
        speakerNotes: '現場先用手機號碼分三段背誦作為開場小遊戲，建立直覺。',
      },
      {
        id: 'u2',
        title: '隨堂確認',
        assertion: '診斷型隨堂測驗能立即糾正學習者的常見誤解',
        slidePoints: ['每個錯誤選項都附上觀念解釋', '搭配圖解立即驗證是否懂了'],
        bookProse: ['完成單元練習能把知識從工作記憶穩固送入長期記憶。'],
        visual: { svg: '<svg viewBox="0 0 100 40"></svg>' },
        quiz: {
          question: '為什麼電話號碼要分段唸？',
          options: [
            { text: '為了符合資訊組塊原則降低工作記憶負擔', explanation: '正確！分段就是組塊化。' },
            { text: '只是為了拖延通話時間', explanation: '不對喔，這是為了幫助人腦記憶。' },
          ],
          correctIndex: 0,
        },
        speakerNotes: '請同學舉手分享自己記帳號或密碼的小技巧。',
      },
    ],
  };
}

test('Text metrics, HTML escaping, and glossary token rendering work accurately', () => {
  assert.equal(escapeHtml(`<script>"&'</script>`), '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
  assert.equal(countReadableUnits('Hello world 你好嗎'), 5);

  const book = makeSampleBook();
  const map = buildGlossaryIndex(book.glossary);
  const rendered = renderGlossaryTokens('善用 [[chunk]] 與 [[unknown]] <tag>', map);

  assert.ok(rendered.includes('data-glossary-term="chunk"'));
  assert.ok(rendered.includes('>資訊組塊</button>'));
  assert.ok(rendered.includes('unknown &lt;tag&gt;'));
  assert.ok(estimateReadingMinutes(book) >= 1);
});

test('pedagogyLinter rewards well-structured books and penalizes concrete flaws dynamically', () => {
  const goodBook = makeSampleBook();
  const goodReport = lintBook(goodBook);
  assert.equal(goodReport.errors.length, 0);
  assert.equal(goodReport.passed, true);
  assert.ok(goodReport.score >= 90, `Expected good book score >= 90, got ${goodReport.score}`);

  // Intentionally flawed book: unknown glossary ref, bare chapter title, missing visuals, bloated slide, broken quiz
  const badBook = {
    id: 'bad-book',
    title: '反例教材',
    learningObjectives: [],
    glossary: [],
    units: [
      {
        id: 'bad-1',
        title: '第一章',
        assertion: '第 1 章：介紹',
        slidePoints: [
          '這是一條刻意寫得非常非常冗長而且完全不打算讓聽眾一眼看懂的文字牆重點句，用來驗證字數稽核器是不是真的有在運作與扣分',
          '第二條重複重點',
          '第三條',
          '第四條',
          '第五條超過上限',
        ],
        bookProse: ['這裡引用了不存在的名詞 [[ghost-term]]。'],
        speakerNotes: '',
        quiz: {
          question: '壞題目',
          options: [
            { text: '正確語句但缺解析', explanation: '' },
            { text: '第二個選項但沒寫解釋', explanation: '' },
          ],
          correctIndex: 4,
        },
      },
    ],
  };

  const badReport = lintBook(badBook);
  assert.equal(badReport.passed, false);
  assert.ok(badReport.errors.length >= 3, `Expected >= 3 linter errors, got ${badReport.errors.length}`);
  assert.ok(badReport.warnings.length >= 4, `Expected >= 4 linter warnings, got ${badReport.warnings.length}`);
  assert.ok(badReport.score < 50, `Expected bad book score < 50, got ${badReport.score}`);
});

test('120-run deterministic headless state-machine fuzz simulation (0 deadlocks, invariants hold)', () => {
  const book = makeSampleBook();
  // Expand to 6 units for rich state transitions
  for (let i = 3; i <= 6; i++) {
    book.units.push({
      id: `u${i}`,
      title: `擴充單元 ${i}`,
      assertion: `擴充單元 ${i} 的完整結論陳述句幫助建立架構感`,
      slidePoints: ['精要重點一', '精要重點二'],
      bookProse: [`第 ${i} 單元散文說明 [[chunk]] 的實務應用。`],
      visual: { svg: '<svg viewBox="0 0 80 30"></svg>' },
      speakerNotes: '補充這個單元的教室實務操作提詞與停頓建議。',
    });
  }

  const rng = makeRng(987654321);
  let state = createViewerState({ book, initialMode: 'book' });
  let prevCompletedCount = computeProgress(state).completedCount;

  for (let step = 0; step < 120; step++) {
    const r = rng();
    if (r < 0.2) {
      state = transitionViewerState(state, { type: 'NEXT_UNIT' });
    } else if (r < 0.35) {
      state = transitionViewerState(state, { type: 'PREV_UNIT' });
    } else if (r < 0.45) {
      state = transitionViewerState(state, { type: 'TOGGLE_MODE' });
    } else if (r < 0.55) {
      const idx = Math.floor(rng() * book.units.length);
      state = transitionViewerState(state, { type: 'GO_TO_UNIT', index: idx });
    } else if (r < 0.65) {
      state = transitionViewerState(state, { type: 'CYCLE_THEME' });
    } else if (r < 0.75) {
      const scale = 0.7 + rng() * 0.9; // deliberately includes out-of-bounds values to test clamping
      state = transitionViewerState(state, { type: 'SET_FONT_SCALE', scale });
    } else if (r < 0.85) {
      state = transitionViewerState(state, { type: 'TOGGLE_NOTES' });
    } else if (r < 0.93) {
      state = transitionViewerState(state, {
        type: 'SET_WIDGET_STATE',
        widgetId: 'cognitive-load-sim',
        patch: { complexity: 1 + Math.floor(rng() * 3), removeClutter: rng() > 0.5 },
      });
    } else {
      state = transitionViewerState(state, {
        type: 'ANSWER_QUIZ',
        unitId: 'u2',
        optionIndex: rng() > 0.5 ? 0 : 1,
        isCorrect: rng() > 0.5,
      });
    }

    // Invariant 1: index strictly bounded
    assert.ok(state.currentIndex >= 0 && state.currentIndex < book.units.length);
    // Invariant 2: theme valid
    assert.ok(THEME_ORDER.includes(state.theme));
    // Invariant 3: fontScale strictly clamped [0.85, 1.35]
    assert.ok(state.fontScale >= 0.85 && state.fontScale <= 1.35);
    // Invariant 4: completedCount is monotonically non-decreasing
    const prog = computeProgress(state);
    assert.ok(prog.completedCount >= prevCompletedCount);
    assert.ok(prog.percentage >= 0 && prog.percentage <= 100);
    prevCompletedCount = prog.completedCount;

    // Invariant 5: serialization round-trip preserves widget state across modes
    const raw = serializeProgress(state);
    const restored = deserializeProgress(raw);
    const rehydrated = createViewerState({
      book,
      initialMode: state.mode,
      savedProgress: restored,
    });
    assert.equal(rehydrated.currentIndex, state.currentIndex);
    assert.deepEqual(rehydrated.widgetStates, state.widgetStates);
  }
});
