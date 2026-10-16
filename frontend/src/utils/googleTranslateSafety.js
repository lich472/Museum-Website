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
 * node the translator has already moved is taken out of wherever it now lives
 * instead of throwing. With English selected nothing is patched in practice —
 * the original methods run and still throw exactly as stock React expects.
 *
 * Prefer not to patch the DOM? Delete this file and its call in `main.jsx`.
 * The translator keeps working; the app just becomes vulnerable to the crash
 * above whenever a translation is active.
 */

let translationActive = false;
let suppressionCount = 0;

/** Google marks <html> with `translated-ltr` / `translated-rtl` once done. */
function isTranslationActive() {
  if (!translationActive) {
    translationActive =
      document.documentElement.classList.contains("translated-ltr") ||
      document.documentElement.classList.contains("translated-rtl");
  }
  return translationActive;
}

/**
 * Report every suppression, with a running total.
 *
 * This used to latch after the first one, which made every later occurrence
 * invisible: the console looked the same whether the page recovered or kept
 * thrashing on every route change. The count keeps the signal and the total
 * without hiding anything.
 */
function reportSuppression(message) {
  suppressionCount += 1;
  console.warn(`[google-translate] ${message} (suppression #${suppressionCount})`);
}

export function installGoogleTranslateGuard() {
  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function removeChild(child) {
    const currentParent = child ? child.parentNode : null;

    if (isTranslationActive() && currentParent !== this) {
      if (!currentParent) {
        // Already detached — by a previous call here, or by the translator.
        // There is nothing left to remove, and throwing is the crash this
        // guard exists to prevent.
        reportSuppression(
          "a node React removed was already detached; nothing left to remove"
        );
        return child;
      }

      // The translator re-parented this node, so React's `removeChild` on the
      // old parent would throw. Take it out of wherever it now lives: leaving
      // it put a node React had deleted back in the DOM, where it survived as a
      // stale fragment across route changes.
      try {
        originalRemoveChild.call(currentParent, child);
        reportSuppression(
          "a node React removed had been moved by the translator; removed it from its current parent"
        );
      } catch {
        // Its current parent refused the removal. Do not claim a success that
        // did not happen: the node really is still in the document.
        reportSuppression(
          "a node React removed had been moved by the translator and was LEFT IN THE DOM"
        );
      }

      return child;
    }

    return originalRemoveChild.call(this, child);
  };

  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this && isTranslationActive()) {
      const anchorParent = referenceNode.parentNode;

      if (anchorParent) {
        // Insert next to the anchor where it now lives. Appending to the end of
        // `this` instead silently reordered the content around the anchor.
        const inserted = originalInsertBefore.call(
          anchorParent,
          newNode,
          referenceNode
        );
        reportSuppression(
          "an insertBefore anchor had been moved by the translator; inserted before it in its current parent"
        );
        return inserted;
      }

      // The anchor has no parent left to insert next to, so append — which is
      // what the stock implementation does with a null reference node.
      const appended = originalInsertBefore.call(this, newNode, null);
      reportSuppression(
        "an insertBefore anchor had been moved by the translator and has no parent; appended instead"
      );
      return appended;
    }

    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}
