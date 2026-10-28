import { useEffect, useState } from "react";

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

function isWidgetScriptLoaded(): boolean {
  const googleNamespace = (
    window as unknown as { google?: { translate?: unknown } }
  ).google;

  return typeof googleNamespace?.translate !== "undefined";
}

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

export function readCurrentLanguage(): LanguageCode {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return SOURCE_LANGUAGE;

  const target = (decodeURIComponent(match[1]).split("/").pop() ?? "").toLowerCase();
  const known = LANGUAGES.find((language) => language.code.toLowerCase() === target);

  return known ? known.code : SOURCE_LANGUAGE;
}

function applyLanguage(code: LanguageCode): void {
  document.cookie = `${COOKIE_NAME}=/${SOURCE_LANGUAGE}/${code};path=/`;
  window.location.reload();
}

function LanguageSwitcher() {
  const [language, setLanguage] = useState<LanguageCode>(readCurrentLanguage);
  const [translationUnavailable, setTranslationUnavailable] = useState(false);

  useEffect(() => {
    setLanguage(readCurrentLanguage());
  }, []);

  useEffect(() => {
    if (language === SOURCE_LANGUAGE || hasTranslated()) {
      setTranslationUnavailable(false);
      return;
    }

    const startedAt = Date.now();

    const decide = (): boolean => {
      if (hasTranslated()) {
        setTranslationUnavailable(false);
        return true;
      }

      const waited = Date.now() - startedAt;

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

  const shownLanguage = translationUnavailable ? SOURCE_LANGUAGE : language;

  return (
    <>
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
            <option key={option.code} value={option.code} lang={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {translationUnavailable && (
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
