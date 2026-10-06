import { useEffect, useState } from "react";
import { Lang } from "../i18n/translations";
import { startTranslating } from "../i18n/translator";

const STORAGE_KEY = "sahayam_lang";

const LANGUAGES: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "English", name: "English" },
  { code: "hi", label: "हिन्दी", name: "Hindi" },
  { code: "gu", label: "ગુજરાતી", name: "Gujarati" },
];

function initialLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "hi" || v === "gu") return v;
  } catch {
    /* ignore */
  }
  return "en";
}

/** Slim government-style utility bar with the language selector; translates the whole interface. */
export default function LanguageBar() {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    return startTranslating(lang);
  }, [lang]);

  return (
    <div className="lang-bar" role="navigation" aria-label="Language">
      <div className="lang-bar-inner">
        <span className="lang-bar-label" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Language</span>
        </span>
        <div className="lang-bar-options" role="group" aria-label="Select language">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              data-no-translate
              className={`lang-bar-btn${lang === l.code ? " active" : ""}`}
              aria-pressed={lang === l.code}
              lang={l.code}
              title={l.name}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
