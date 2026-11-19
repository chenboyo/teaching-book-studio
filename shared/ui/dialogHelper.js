/**
 * Accessible native <dialog> helper with progressive top-layer exit animation fallback
 * and bounding-box light-dismiss fallback (`closedby="any"`).
 */

let supportsDisplayTransition;

export function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (typeof window === 'undefined' || !window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

export function supportsTopLayerExit() {
  return Boolean(typeof window !== 'undefined' && window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
}

export async function closeTopLayer(dialog) {
  if (!dialog?.open) return;
  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations ? dialog.getAnimations({ subtree: true }) : [];
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 400)),
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }
  dialog.close();
}

export function setupAccessibleDialogs(selector = 'dialog.lab-dialog') {
  const dialogs = Array.from(document.querySelectorAll(selector));

  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of dialogs) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) {
          closeTopLayer(dialog);
        }
      });
    }
  }

  for (const dialog of dialogs) {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });
    dialog.addEventListener('close', () => {
      dialog.removeAttribute('data-closing');
      dialog.returnValue = '';
    });
  }

  return {
    dialogs,
    closeAnimated: closeTopLayer,
  };
}
