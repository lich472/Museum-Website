/**
 * React and Google Translate both want to own the DOM.
 *
 * The translator rewrites every text node into a `<font>` wrapper. React still
 * believes it owns the original text node, so its next update throws:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * That blanks the page, and it hits exactly the re-renders this app does all
 * the time — `loading` turning into content, and every route change.
 *
 * The guard below changes behaviour ONLY while a translation is in effect: a
 * node the translator has already moved is left where it is instead of
 * throwing. With English selected nothing is patched in practice — the original
 * methods run and still throw exactly as stock React expects.
 *
 * Prefer not to patch the DOM? Delete this file and its call in `main.jsx`.
 * The translator keeps working; the app just becomes vulnerable to the crash
 * above whenever a translation is active.
 */

let translationActive = false;
let hasWarned = false;

/** Google marks <html> with `translated-ltr` / `translated-rtl` once done. */
function isTranslationActive() {
  if (!translationActive) {
    translationActive =
      document.documentElement.classList.contains("translated-ltr") ||
      document.documentElement.classList.contains("translated-rtl");
  }
  return translationActive;
}

function warnOnce(message) {
  if (hasWarned) return;
  hasWarned = true;
  console.warn(`[google-translate] ${message}`);
}

export function installGoogleTranslateGuard() {
  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function removeChild(child) {
    if (this !== child.parentNode && isTranslationActive()) {
      warnOnce(
        "a node React tried to remove had been moved by the translator; leaving it in place"
      );
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    let anchor = referenceNode;
    if (anchor && anchor.parentNode !== this && isTranslationActive()) {
      warnOnce(
        "an insertBefore anchor had been moved by the translator; appending instead"
      );
      anchor = null;
    }
    return originalInsertBefore.call(this, newNode, anchor);
  };
}
