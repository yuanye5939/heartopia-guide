export type Language = "en" | "de" | "it" | "fr" | "es" | "ja" | "ko" | "id" | "pl";

export interface ModuleI18n {
  title: string;
  description: string;
}

export interface UIStrings {
  siteDescription: string;
  nav: {
    beginnerGuide: string;
    codes: string;
    walkthrough: string;
    characters: string;
    resources: string;
    hobbies: string;
    crafting: string;
    map: string;
    collections: string;
    fish: string;
    bugs: string;
    birds: string;
    recipes: string;
  };
  modules: {
    beginnerGuide: ModuleI18n;
    codes: ModuleI18n;
    walkthrough: ModuleI18n;
    characters: ModuleI18n;
    resources: ModuleI18n;
    hobbies: ModuleI18n;
    crafting: ModuleI18n;
    building: ModuleI18n;
    events: ModuleI18n;
    multiplayer: ModuleI18n;
    map: ModuleI18n;
    fish: ModuleI18n;
    bugs: ModuleI18n;
    birds: ModuleI18n;
    crops: ModuleI18n;
    flowers: ModuleI18n;
    forageables: ModuleI18n;
    petsCats: ModuleI18n;
    petsDogs: ModuleI18n;
    wildAnimals: ModuleI18n;
    achievements: ModuleI18n;
    recipes: ModuleI18n;
    songs: ModuleI18n;
  };
  home: {
    heroTitle: string;
    startHere: string;
    redeemCodes: string;
    allGuides: string;
  };
  footer: {
    disclaimer: string;
    languages: string;
    privacy: string;
    terms: string;
    contact: string;
  };
  langLabel: string;
}

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "pl", label: "Polski" },
];

export const DEFAULT_LANG: Language = "en";
