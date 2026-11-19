/**
 * Central Teaching Books & Presentations Catalog.
 * Add a new entry here whenever adding a book under `books/<id>/`
 * (or run `npm run new-book -- <slug> "<title>" [category] [audience]`).
 */
export const BOOK_CATALOG = [
  {
    id: 'cognitive-design-guide',
    title: '讓複雜變簡單：易懂教學教材與簡報設計指南',
    subtitle: '認知負荷理論 × Mayer 12 原則 × 斷言-視覺證據實戰工作坊',
    category: '教學設計・簡報表達',
    audience: '教師・講師・教材製作人',
    level: '實戰入門',
    icon: '📖',
    accent: '#1b365d',
    tags: ['認知負荷', 'Mayer 12原則', '斷言-視覺證據', '雙模簡報'],
    description:
      '從零拆解「為什麼聽眾看簡報總是記不住？」透過 8 個循序單元、詞彙預習卡片、認知負荷模擬器與簡報前後改造對比台，帶你做出好讀又好講的雙模教材與展示簡報。',
    entry: './books/cognitive-design-guide/index.html',
    storageKey: 'book_cognitive-design-guide_progress_v1',
    unitCount: 8,
    estimatedMinutes: 8,
  },
];
