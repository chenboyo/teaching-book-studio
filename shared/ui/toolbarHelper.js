/**
 * Accessible composite toolbar helper.
 * Keeps native `focusgroup="toolbar wrap"` on supporting browsers and installs
 * a roving-tabindex + arrow-key fallback ONLY when native focusGroup is missing.
 */

export function setupAccessibleToolbars(root = document) {
  const toolbars = Array.from(root.querySelectorAll('[role="toolbar"]'));
  const hasNativeFocusGroup =
    typeof HTMLElement !== 'undefined' && 'focusGroup' in HTMLElement.prototype;

  for (const bar of toolbars) {
    if (bar.dataset.toolbarBound === 'true') continue;
    bar.dataset.toolbarBound = 'true';

    // Guard aria-disabled controls against click activation while keeping them focusable
    bar.addEventListener('click', (event) => {
      const targetBtn = event.target.closest('button, [role="button"]');
      if (targetBtn && targetBtn.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    if (hasNativeFocusGroup) continue;

    const getItems = () =>
      Array.from(bar.querySelectorAll('button, [role="button"], a[href]')).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );

    const initialItems = getItems();
    initialItems.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });

    bar.addEventListener('focusin', (event) => {
      const item = event.target.closest('button, [role="button"], a[href]');
      if (!item || !bar.contains(item)) return;
      const items = getItems();
      if (!items.includes(item)) return;
      items.forEach((b) => {
        b.tabIndex = b === item ? 0 : -1;
      });
    });

    bar.addEventListener('keydown', (event) => {
      const items = getItems();
      if (items.length === 0) return;

      const currentIdx = items.indexOf(document.activeElement);
      if (currentIdx === -1) return;

      const vertical = bar.getAttribute('aria-orientation') === 'vertical';
      const rtl = typeof getComputedStyle === 'function' && getComputedStyle(bar).direction === 'rtl';
      const steps = vertical
        ? { ArrowDown: 1, ArrowUp: -1 }
        : { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };

      let nextIdx = null;
      if (event.key in steps) {
        nextIdx = (currentIdx + steps[event.key] + items.length) % items.length;
      } else if (event.key === 'Home') {
        nextIdx = 0;
      } else if (event.key === 'End') {
        nextIdx = items.length - 1;
      }

      if (nextIdx === null) return;
      event.preventDefault();
      const target = items[nextIdx];
      items.forEach((b) => {
        b.tabIndex = b === target ? 0 : -1;
      });
      target.focus();
    });
  }

  return toolbars;
}
