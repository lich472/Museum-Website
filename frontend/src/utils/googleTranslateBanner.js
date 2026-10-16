/**
 * Removes Google Translate's own top bar.
 *
 * After translating, the widget injects a fixed, full-width bar at the top of
 * <body> announcing the translation and offering "Show original". The site has
 * its own language dropdown, so that bar is redundant — and it pushes the rest
 * of the page down to make room for itself.
 *
 * It is matched **structurally** (fixed, pinned to the top, stacked above
 * everything) rather than by class name, because Google's class names are
 * build-hashed and change between releases: as of build TE_20261007 the bar is
 * `VIpgJd-ZVi9od-ORHb-OEVmcd`, and hard-coding that would quietly stop working
 * the next time they ship. App.css hides the same elements by name as well, so
 * there is no flash before this runs.
 *
 * Note this hides Google's own attribution UI. The site still offers both
 * directions of switching through its own dropdown.
 *
 * Nothing is hidden on the strength of the `googtrans` cookie alone. That cookie
 * is written by the site's own dropdown, before — and whether or not — the
 * widget ever loads, so where translate.google.com is unreachable (see the
 * comment on the script tag in `index.html`) it proves nothing. Suppression
 * waits for a signal only Google can give: the `translated-ltr` / `translated-rtl`
 * class it puts on `<html>` when it really translates. A requested translation
 * that never arrives is reported instead of hidden.
 */

/** Anything stacked this high at the top of the page is Google's bar. */
const MIN_BANNER_Z_INDEX = 10000000;

/** How long to keep re-checking after translation starts, in 500ms ticks. */
const RETRY_TICKS = 20;

/**
 * Latched once Google has been OBSERVED to translate. It marks `<html>` with
 * `translated-ltr` / `translated-rtl` only when it really has, and keeps the
 * class while the translation is in effect.
 *
 * The `googtrans` cookie deliberately does NOT count: the site's own dropdown
 * writes it before — and regardless of whether — the widget loads, so treating
 * it as proof suppressed the banner for a translation that never happened.
 */
let translationObserved = false;

/** Did the visitor ask for a translation? The site's own cookie says so. */
function translationRequested() {
  return /(?:^|;\s*)googtrans=\/en\/(?!en)/.test(document.cookie);
}

/** Is a translation actually in effect? Only Google's own marker counts. */
function isTranslating() {
  if (!translationObserved) {
    const html = document.documentElement;

    translationObserved =
      html.classList.contains("translated-ltr") ||
      html.classList.contains("translated-rtl");
  }

  return translationObserved;
}

/**
 * Report a translation that was asked for and never arrived, rather than
 * leaving the page looking as though it had been translated (or hiding a bar
 * that was never there).
 */
function reportMissingTranslation() {
  console.warn(
    "[google-translate] a translation was requested but Google never translated this " +
      "page (no translated-ltr/translated-rtl on <html>). The page is still in English " +
      "and nothing was hidden. Check that translate.google.com is reachable."
  );
}

function looksLikeGoogleBar(element) {
  const style = window.getComputedStyle(element);

  return (
    style.position === "fixed" &&
    style.top === "0px" &&
    Number.parseInt(style.zIndex, 10) >= MIN_BANNER_Z_INDEX
  );
}

function hideBanners() {
  // Do nothing at all until Google has really translated the page.
  if (!isTranslating()) return;

  // "div, iframe" covers the bar wherever Google nests it, and keeps this far
  // away from the React tree (which is inside #root).
  for (const element of document.body.querySelectorAll("div, iframe")) {
    if (looksLikeGoogleBar(element)) {
      element.style.setProperty("display", "none", "important");
    }
  }

  // The translator offsets the body to sit below the bar.
  document.body.style.setProperty("top", "0", "important");
}

export function suppressGoogleTranslateBanner() {
  const start = () => {
    hideBanners();

    // The bar appears asynchronously once the translation completes.
    new MutationObserver(hideBanners).observe(document.body, {
      childList: true,
      subtree: true,
    });

    // A few extra passes cover the bar being inserted inside an existing
    // container, where no mutation on <body> itself would fire.
    let ticks = 0;
    const timer = window.setInterval(() => {
      hideBanners();
      ticks += 1;
      if (ticks >= RETRY_TICKS) {
        window.clearInterval(timer);

        // The widget has had its chance. If a translation was requested and
        // Google never applied one, say so: the alternative — saying nothing —
        // is what made a dead translator look like a working one.
        if (translationRequested() && !isTranslating()) {
          reportMissingTranslation();
        }
      }
    }, 500);
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
}
