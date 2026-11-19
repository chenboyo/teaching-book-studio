import {
  buildGlossaryIndex,
  countReadableUnits,
  estimateReadingMinutes,
  extractGlossaryRefs,
} from './bookEngine.js';

/**
 * Pure pedagogical quality & cognitive-load linter.
 * Enforces Richard Mayer's 12 Multimedia Learning Principles + Assertion-Evidence Design.
 */

export const LINT_RULES = {
  MIN_ASSERTION_UNITS: 8,
  MAX_ASSERTION_UNITS: 42,
  MAX_SLIDE_POINTS: 4,
  MAX_SLIDE_POINT_UNITS: 34,
  MAX_SLIDE_TOTAL_UNITS: 145,
  MAX_PROSE_UNITS_PER_UNIT: 480,
  MIN_SPEAKER_NOTES_UNITS: 18,
  MIN_VISUAL_RATIO: 0.6,
};

export function lintUnit(unit, index, glossaryMap) {
  const errors = [];
  const warnings = [];
  const label = unit?.id || `unit-${index + 1}`;

  if (!unit || typeof unit !== 'object') {
    errors.push(`[${label}] Unit entry must be an object.`);
    return { id: label, hasVisualEvidence: false, slideUnits: 0, proseUnits: 0, errors, warnings };
  }

  if (!unit.id || !/^[a-z0-9-]+$/.test(unit.id)) {
    errors.push(`[${label}] Unit id must match /^[a-z0-9-]+$/.`);
  }
  if (!unit.title || !String(unit.title).trim()) {
    errors.push(`[${label}] Unit is missing a short navigation title.`);
  }
  if (!unit.assertion || !String(unit.assertion).trim()) {
    errors.push(`[${label}] Unit is missing an Assertion-Evidence headline ("assertion").`);
  }

  const proseArr = Array.isArray(unit.bookProse) ? unit.bookProse : [];
  const slideArr = Array.isArray(unit.slidePoints) ? unit.slidePoints : [];
  if (proseArr.length === 0 && slideArr.length === 0 && !unit.quiz) {
    errors.push(`[${label}] Unit has neither bookProse, slidePoints, nor quiz content.`);
  }

  // Glossary [[termId]] integrity across prose & slidePoints
  const allTextSegments = [...proseArr, ...slideArr, unit.assertion || '', unit.speakerNotes || ''];
  for (const seg of allTextSegments) {
    for (const refId of extractGlossaryRefs(seg)) {
      if (!glossaryMap.has(refId)) {
        errors.push(`[${label}] Unknown glossary reference "[[${refId}]]" not defined in book.glossary.`);
      }
    }
  }

  // Diagnostic quiz validation
  if (unit.quiz) {
    const q = unit.quiz;
    if (!q.question || !String(q.question).trim()) {
      errors.push(`[${label}] Quiz is missing a question.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`[${label}] Quiz must contain at least 2 options.`);
    } else {
      if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        errors.push(`[${label}] Quiz has an invalid correctIndex (${q.correctIndex}).`);
      }
      q.options.forEach((opt, optIdx) => {
        if (!opt || !opt.text || !opt.explanation || !String(opt.explanation).trim()) {
          errors.push(`[${label}] Quiz option #${optIdx + 1} must provide diagnostic "text" and "explanation".`);
        }
      });
    }
  }

  // Assertion quality checks (Alley Assertion-Evidence)
  const assertionUnits = countReadableUnits(unit.assertion);
  if (unit.assertion) {
    if (assertionUnits < LINT_RULES.MIN_ASSERTION_UNITS) {
      warnings.push(`[${label}] Assertion headline is too short (${assertionUnits} units); state a complete takeaway sentence.`);
    } else if (assertionUnits > LINT_RULES.MAX_ASSERTION_UNITS) {
      warnings.push(`[${label}] Assertion headline exceeds ${LINT_RULES.MAX_ASSERTION_UNITS} units (${assertionUnits}).`);
    }
    if (/^第\s*[0-9一二三四五六七八九十]+\s*[章節單元][:：]/.test(String(unit.assertion).trim())) {
      warnings.push(`[${label}] Assertion looks like a bare chapter label instead of a declarative conclusion.`);
    }
  }

  // Slide density & Mayer Redundancy checks
  if (slideArr.length === 0) {
    warnings.push(`[${label}] Unit has no concise slidePoints for Slide Mode.`);
  } else if (slideArr.length > LINT_RULES.MAX_SLIDE_POINTS) {
    warnings.push(`[${label}] slidePoints has ${slideArr.length} bullets (max ${LINT_RULES.MAX_SLIDE_POINTS}); split or move details to speakerNotes.`);
  }

  let slideUnits = assertionUnits;
  slideArr.forEach((pt, i) => {
    const len = countReadableUnits(pt);
    slideUnits += len;
    if (len > LINT_RULES.MAX_SLIDE_POINT_UNITS) {
      warnings.push(`[${label}] slidePoints[${i}] is too wordy (${len} units > ${LINT_RULES.MAX_SLIDE_POINT_UNITS}).`);
    }
  });

  if (slideUnits > LINT_RULES.MAX_SLIDE_TOTAL_UNITS) {
    warnings.push(`[${label}] Total slide cognitive density is ${slideUnits} units (budget <= ${LINT_RULES.MAX_SLIDE_TOTAL_UNITS}).`);
  }

  // Book prose segmenting check
  const proseUnits = proseArr.reduce((sum, p) => sum + countReadableUnits(p), 0);
  if (proseUnits > LINT_RULES.MAX_PROSE_UNITS_PER_UNIT) {
    warnings.push(`[${label}] bookProse has ${proseUnits} units (> ${LINT_RULES.MAX_PROSE_UNITS_PER_UNIT}); segment into smaller units.`);
  }

  // Speaker notes coverage
  const notesUnits = countReadableUnits(unit.speakerNotes);
  if (notesUnits < LINT_RULES.MIN_SPEAKER_NOTES_UNITS) {
    warnings.push(`[${label}] speakerNotes is missing or too brief (${notesUnits} units); move spoken explanations out of the slide.`);
  }

  // Visual evidence check
  const hasVisualEvidence = Boolean(
    (unit.visual && unit.visual.svg) ||
    unit.widgetId ||
    unit.comparison ||
    (Array.isArray(unit.checklist) && unit.checklist.length > 0) ||
    (Array.isArray(unit.glossaryFocusIds) && unit.glossaryFocusIds.length > 0)
  );
  if (!hasVisualEvidence && !unit.quiz) {
    warnings.push(`[${label}] Unit lacks visual evidence (inline SVG, comparison card, or interactive widget).`);
  }

  return {
    id: label,
    hasVisualEvidence,
    slideUnits,
    proseUnits,
    errors,
    warnings,
  };
}

export function lintBook(book) {
  const errors = [];
  const warnings = [];

  if (!book || typeof book !== 'object') {
    return {
      bookId: 'unknown',
      title: 'Invalid Book',
      score: 0,
      grade: 'D',
      passed: false,
      unitCount: 0,
      estimatedMinutes: 0,
      visualEvidenceRatio: 0,
      errors: ['Book data object is missing.'],
      warnings: [],
      unitReports: [],
    };
  }

  if (!book.id || !/^[a-z0-9-]+$/.test(book.id)) {
    errors.push('Book is missing a valid slug id (/^[a-z0-9-]+$/).');
  }
  if (!book.title || !String(book.title).trim()) {
    errors.push('Book is missing a title.');
  }
  if (!Array.isArray(book.units) || book.units.length === 0) {
    errors.push('Book must contain at least 1 instructional unit.');
  }

  const objectives = Array.isArray(book.learningObjectives) ? book.learningObjectives : [];
  if (objectives.length < 2) {
    warnings.push('Include at least 2 measurable learningObjectives so learners know what they will master.');
  }

  const glossary = Array.isArray(book.glossary) ? book.glossary : [];
  if (glossary.length < 2) {
    warnings.push('Include at least 2 glossary terms to support Mayer Pre-training.');
  }

  const glossaryMap = buildGlossaryIndex(glossary);
  const units = Array.isArray(book.units) ? book.units : [];
  const unitReports = units.map((u, idx) => lintUnit(u, idx, glossaryMap));

  let visualCount = 0;
  for (const rep of unitReports) {
    if (rep.hasVisualEvidence) visualCount++;
    errors.push(...rep.errors);
    warnings.push(...rep.warnings);
  }

  const visualEvidenceRatio = units.length > 0 ? visualCount / units.length : 0;
  if (units.length > 0 && visualEvidenceRatio < LINT_RULES.MIN_VISUAL_RATIO) {
    warnings.push(
      `Visual evidence coverage is ${(visualEvidenceRatio * 100).toFixed(0)}% (recommended >= ${LINT_RULES.MIN_VISUAL_RATIO * 100}%).`
    );
  }

  // Dynamic score deduction based strictly on real findings
  let score = 100;
  score -= errors.length * 20;
  score -= warnings.length * 5;
  if (units.length > 0 && visualEvidenceRatio < LINT_RULES.MIN_VISUAL_RATIO) {
    score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
  const passed = errors.length === 0 && score >= 70;

  return {
    bookId: book.id || 'unknown',
    title: book.title || 'Untitled Book',
    score,
    grade,
    passed,
    unitCount: units.length,
    estimatedMinutes: estimateReadingMinutes(book),
    visualEvidenceRatio,
    errors,
    warnings,
    unitReports,
  };
}

export function formatAuditReport(results) {
  const lines = [];
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    const visPct = `${Math.round(r.visualEvidenceRatio * 100)}%`;
    lines.push(
      `[${status}] ${r.bookId} — "${r.title}" | Score: ${r.score}/100 (${r.grade}) | Units: ${r.unitCount} | Visuals: ${visPct} | ~${r.estimatedMinutes} min | Errors: ${r.errors.length}, Warnings: ${r.warnings.length}`
    );
    for (const err of r.errors) {
      lines.push(`    ERROR: ${err}`);
    }
    for (const warn of r.warnings) {
      lines.push(`    WARN : ${warn}`);
    }
  }
  return lines.join('\n');
}
