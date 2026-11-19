import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOK_DATA } from '../src/data/content.js';
import { evaluateCognitiveLoadState, SLIDE_MAKEOVER_DATA } from '../src/widgets/interactiveDemos.js';
import {
  buildGlossaryIndex,
  computeProgress,
  createViewerState,
  extractGlossaryRefs,
  transitionViewerState,
} from '../../../shared/engine/bookEngine.js';
import { lintBook } from '../../../shared/engine/pedagogyLinter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookDir = path.resolve(__dirname, '..');

function makeRng(seed = 424242) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('cognitive-design-guide manifest and pedagogy linter pass at Grade A (>= 90)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(bookDir, 'book.json'), 'utf8'));
  assert.equal(manifest.id, 'cognitive-design-guide');

  const report = lintBook(BOOK_DATA);
  assert.equal(report.errors.length, 0, `Unexpected errors: ${report.errors.join('; ')}`);
  assert.equal(report.passed, true);
  assert.ok(report.score >= 90, `Expected Grade A score >= 90, got ${report.score} (${report.warnings.join('; ')})`);
  assert.equal(report.unitCount, 8);
  assert.equal(report.visualEvidenceRatio, 1);
});

test('Cognitive load simulator evaluates overload vs optimal load dynamically', () => {
  const baseline = evaluateCognitiveLoadState({ complexity: 2 });
  assert.equal(baseline.status, 'overload');
  assert.ok(baseline.totalLoad > 100);

  const optimized = evaluateCognitiveLoadState({
    complexity: 2,
    removeClutter: true,
    addSignaling: true,
    segmentSteps: true,
    avoidRedundantText: true,
  });
  assert.equal(optimized.status, 'optimal');
  assert.ok(optimized.totalLoad < 82);
  assert.ok(optimized.remainingCapacity > 0);

  assert.ok(SLIDE_MAKEOVER_DATA.before.bullets.length >= 3);
  assert.ok(SLIDE_MAKEOVER_DATA.after.bars.length === 3);
});

test('100-iteration randomized reader & presenter journey across all 8 units and 3 quizzes', () => {
  const rng = makeRng(777888);
  const glossaryMap = buildGlossaryIndex(BOOK_DATA.glossary);

  // Verify every glossary reference across the book resolves cleanly
  for (const unit of BOOK_DATA.units) {
    for (const p of unit.bookProse || []) {
      for (const ref of extractGlossaryRefs(p)) {
        assert.ok(glossaryMap.has(ref), `Missing glossary entry ${ref} in unit ${unit.id}`);
      }
    }
  }

  let state = createViewerState({ book: BOOK_DATA, initialMode: 'slide' });

  for (let i = 0; i < 100; i++) {
    const pick = rng();
    if (pick < 0.25) {
      state = transitionViewerState(state, { type: 'NEXT_UNIT' });
    } else if (pick < 0.45) {
      state = transitionViewerState(state, { type: 'PREV_UNIT' });
    } else if (pick < 0.6) {
      state = transitionViewerState(state, { type: 'TOGGLE_MODE' });
    } else if (pick < 0.75) {
      state = transitionViewerState(state, { type: 'TOGGLE_NOTES' });
    } else if (pick < 0.9) {
      const targetUnit = BOOK_DATA.units[Math.floor(rng() * BOOK_DATA.units.length)];
      state = transitionViewerState(state, { type: 'GO_TO_UNIT_ID', unitId: targetUnit.id });
    } else {
      state = transitionViewerState(state, {
        type: 'SET_WIDGET_STATE',
        widgetId: 'cognitive-load-sim',
        patch: { complexity: 3, removeClutter: true },
      });
    }
    assert.ok(state.currentIndex >= 0 && state.currentIndex < 8);
  }

  // Complete all units & answer all quizzes correctly
  for (const unit of BOOK_DATA.units) {
    state = transitionViewerState(state, { type: 'GO_TO_UNIT_ID', unitId: unit.id });
    if (unit.quiz) {
      state = transitionViewerState(state, {
        type: 'ANSWER_QUIZ',
        unitId: unit.id,
        optionIndex: unit.quiz.correctIndex,
        isCorrect: true,
      });
    }
  }

  const finalProgress = computeProgress(state);
  assert.equal(finalProgress.completedCount, 8);
  assert.equal(finalProgress.percentage, 100);
  assert.equal(finalProgress.totalQuizzes, 3);
  assert.equal(finalProgress.quizCorrectCount, 3);
  assert.equal(state.widgetStates['cognitive-load-sim']?.complexity, 3);
});
