import { BOOK_DATA } from './data/content.js';
import { WIDGET_REGISTRY } from './widgets/interactiveDemos.js';
import { mountBookViewer } from '../../../shared/engine/bookViewer.js';

function init() {
  mountBookViewer({
    book: BOOK_DATA,
    widgets: WIDGET_REGISTRY,
    rootSelector: '#book-app',
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
