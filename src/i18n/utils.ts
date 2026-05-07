import { DEFAULT_LANG, LANGUAGES, type Language, type UIStrings } from "./ui";
import { en } from "./en";
import { de } from "./de";
import { it } from "./it";
import { fr } from "./fr";
import { es } from "./es";
import { ja } from "./ja";
import { ko } from "./ko";
import { id } from "./id";
import { pl } from "./pl";

const translations: Record<Language, UIStrings> = {
  en, de, it, fr, es, ja, ko, id, pl,
};

export function getLangFromPath(pathname: string): Language {
  const firstSegment = pathname.split("/")[1];
  if (LANGUAGES.some((l) => l.code === firstSegment)) {
    return firstSegment as Language;
  }
  return DEFAULT_LANG;
}

export function getUIStrings(lang: Language): UIStrings {
  return translations[lang] || translations[DEFAULT_LANG];
}

export function getLocalizedPath(pathname: string, targetLang: Language): string {
  const segments = pathname.split("/").filter(Boolean);
  // Remove current language prefix if any
  if (LANGUAGES.some((l) => l.code === segments[0])) {
    segments.shift();
  }
  const base = segments.join("/") || "";
  if (targetLang === DEFAULT_LANG) {
    return `/${base}`;
  }
  return `/${targetLang}/${base}`;
}
