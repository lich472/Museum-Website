import { useEffect, useState } from "react";

/**
 * Language switcher for the Google Translate website widget.
 *
 * The site is authored in English and translated on demand rather than keeping
 * a second copy of every string: choosing a language records the choice in the
 * `googtrans` cookie — the same cookie Google Translate itself reads — and then
 * reloads, so the translator runs against a freshly rendered page.
 *
 * Reloading, instead of driving Google's hidden <select> directly, is
 * deliberate: it keeps this component out of Google's DOM rewriting, and it
 * means the translator never has to cope with a half-updated React tree.
 *
 * Machine translation, so treat the output as a convenience, not
 * publication-quality copy.
 *
 * A cookie is a request, not a result. This component writes it and reloads,
 * and where `translate.google.com` is unreachable — the case the comment on the
 * script tag in `index.html` anticipates — the reload lands on a still-English
 * page carrying, say, a Chinese cookie. So after the reload the switcher checks
 * that Google really translated, and when it did not it says so plainly and
 * shows English again instead of displaying a language that is not in effect.
 *
 * IMPORTANT: this list and `includedLanguages` in index.html must agree. The
 * widget silently ignores a language that was not declared there.
 */

const SOURCE_LANGUAGE = "en";
const COOKIE_NAME = "googtrans";

/**
 * How long the widget's script gets to define `window.google.translate`. It is
 * loaded with `async` (index.html), so it is legitimately absent for a moment
 * after the page boots.
 */
const WIDGET_SCRIPT_GRACE_MS = 2000;

/**
 * How long the widget gets, in total, to mark the page translated. Long enough
 * for a slow connection, short enough that someone who picked a language is not
 * left staring at an unchanged page with no explanation.
 */
const TRANSLATION_GRACE_MS = 5000;

/** How often the two checks above are re-made while waiting. */
const POLL_MS = 250;

/** Google adds this to <html> only once it has really translated the page. */
function hasTranslated(): boolean {
  const html = document.documentElement;

  return (
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl")
  );
}

/** Has the widget's script run? It defines `google.translate` when it does. */
function isWidgetScriptLoaded(): boolean {
  const googleNamespace = (
    window as unknown as { google?: { translate?: unknown } }
  ).google;

  return typeof googleNamespace?.translate !== "undefined";
}

/**
 * Labels are written in their own language: someone who lands in a language
 * they cannot read still needs to recognise their way back out.
 */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文（简体）" },
  { code: "zh-TW", label: "中文（繁體）" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "el", label: "Ελληνικά" },
  { code: "it", label: "Italiano" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** Which language Google Translate is applying, per the cookie Google uses. */
export function readCurrentLanguage(): LanguageCode {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return SOURCE_LANGUAGE;

  const target = (decodeURIComponent(match[1]).split("/").pop() ?? "").toLowerCase();
  const known = LANGUAGES.find((language) => language.code.toLowerCase() === target);

  // Anything unrecognised (or /en/en, which means "no translation") is English.
  return known ? known.code : SOURCE_LANGUAGE;
}

/**
 * Record the choice and reload.
 *
 * `path=/` with no domain attribute is what keeps this working on localhost,
 * where browsers reject a domain attribute. `/en/en` is how the widget is told
 * to leave the page alone.
 */
function applyLanguage(code: LanguageCode): void {
  document.cookie = `${COOKIE_NAME}=/${SOURCE_LANGUAGE}/${code};path=/`;
  window.location.reload();
}

function LanguageSwitcher() {
  const [language, setLanguage] = useState<LanguageCode>(readCurrentLanguage);
  const [translationUnavailable, setTranslationUnavailable] = useState(false);

  // The cookie is the source of truth, so re-read it once mounted in case the
  // language was changed in another tab.
  useEffect(() => {
    setLanguage(readCurrentLanguage());
  }, []);

  /*
   * Did the language that was asked for actually arrive?
   *
   * Choosing a language writes the cookie and reloads, so the honest place to
   * check is the page that comes back. Nothing is reported while there is still
   * a chance: the interval below waits for the widget's script, then for
   * Google's own marker on <html>, and only then concludes that automatic
   * translation is unavailable.
   */
  useEffect(() => {
    // English is not a translation, so there is nothing to wait for.
    if (language === SOURCE_LANGUAGE || hasTranslated()) {
      setTranslationUnavailable(false);
      return;
    }

    const startedAt = Date.now();

    const decide = (): boolean => {
      // A slow translation is still a translation: check that first.
      if (hasTranslated()) {
        setTranslationUnavailable(false);
        return true;
      }

      const waited = Date.now() - startedAt;

      // The widget never even loaded (blocked script, or offline), or it loaded
      // and never translated. Either way the page is still English.
      if (waited >= TRANSLATION_GRACE_MS) {
        setTranslationUnavailable(true);
        return true;
      }

      if (waited >= WIDGET_SCRIPT_GRACE_MS && !isWidgetScriptLoaded()) {
        setTranslationUnavailable(true);
        return true;
      }

      return false;
    };

    if (decide()) return;

    const timer = window.setInterval(() => {
      if (decide()) window.clearInterval(timer);
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, [language]);

  // The page is only ever in the language that is really in effect, so the
  // dropdown shows English while the requested translation is missing.
  const shownLanguage = translationUnavailable ? SOURCE_LANGUAGE : language;

  return (
    <>
      {/* `notranslate` / translate="no" keep the translator from renaming the
          language options themselves — the switcher should always read in its own
          languages whatever the current one is. */}
      <label
        className="language-switcher notranslate"
        translate="no"
        title="Change language"
      >
        <span className="language-switcher-label" aria-hidden="true">
          🌐
        </span>

        <select
          value={shownLanguage}
          aria-label="Change language"
          onChange={(event) => {
            const next = event.target.value as LanguageCode;
            setLanguage(next);
            applyLanguage(next);
          }}
        >
          {LANGUAGES.map((option) => (
            // `lang` tells a screen reader which voice to use, so "中文" is not
            // read out with English pronunciation (WCAG 3.1.2 Language of Parts).
            <option key={option.code} value={option.code} lang={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {translationUnavailable && (
        // `role="status"` announces it without stealing focus. `notranslate` /
        // translate="no" keep the message itself readable: it explains why the
        // page is not translated, so it must not be translated either. The
        // utilities keep it legible on the dark navbar (App.css styles the
        // switcher, not this).
        <p
          className="language-switcher-notice notranslate text-xs text-amber-200 leading-snug max-w-[220px]"
          translate="no"
          role="status"
        >
          Automatic translation is unavailable, so this page has not been
          translated and is still in English.
        </p>
      )}
    </>
  );
}

export default LanguageSwitcher;
