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
 */

/** Anything stacked this high at the top of the page is Google's bar. */
const MIN_BANNER_Z_INDEX = 10000000;

/** How long to keep re-checking after translation starts, in 500ms ticks. */
const RETRY_TICKS = 20;

/** Is a translation actually in effect? Cheap enough to call on every tick. */
function isTranslating() {
  const html = document.documentElement;

  return (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl") ||
    // Set before the translator has finished, so it catches the early phase.
    /(?:^|;\s*)googtrans=\/en\/(?!en)/.test(document.cookie)
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
  // Do nothing at all while the page is simply English.
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
      if (ticks >= RETRY_TICKS) window.clearInterval(timer);
    }, 500);
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
}
