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
 * IMPORTANT: this list and `includedLanguages` in index.html must agree. The
 * widget silently ignores a language that was not declared there.
 */

const SOURCE_LANGUAGE = "en";
const COOKIE_NAME = "googtrans";

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

  // The cookie is the source of truth, so re-read it once mounted in case the
  // language was changed in another tab.
  useEffect(() => {
    setLanguage(readCurrentLanguage());
  }, []);

  return (
    // `notranslate` / translate="no" keep the translator from renaming the
    // language options themselves — the switcher should always read in its own
    // languages whatever the current one is.
    <label
      className="language-switcher notranslate"
      translate="no"
      title="Change language"
    >
      <span className="language-switcher-label" aria-hidden="true">
        🌐
      </span>

      <select
        value={language}
        aria-label="Change language"
        onChange={(event) => {
          const next = event.target.value as LanguageCode;
          setLanguage(next);
          applyLanguage(next);
        }}
      >
        {LANGUAGES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
