export const SITE = {
  title: "Heartopia Guide",
  description:
    "Free Heartopia strategy guides, redeem codes, walkthroughs, crafting recipes, and tips. Your complete companion for the cozy life-sim by XD Entertainment.",
  url: "https://heartopia.guide",
  defaultLanguage: "en",
  languages: ["en", "de", "it", "fr", "es", "ja", "ko", "id", "pl"] as const,
  languageLabels: {
    en: "English",
    de: "Deutsch",
    it: "Italiano",
    fr: "Français",
    es: "Español",
    ja: "日本語",
    ko: "한국어",
    id: "Bahasa Indonesia",
    pl: "Polski",
  },
};

export const NAV = [
  { label: "Beginner Guide", href: "/beginner-guide" },
  { label: "Codes", href: "/codes" },
  { label: "Walkthrough", href: "/walkthrough" },
  { label: "Characters", href: "/characters" },
  { label: "Resources", href: "/resources" },
  { label: "Hobbies", href: "/hobbies" },
  { label: "Crafting", href: "/crafting" },
];

export const MODULES = [
  {
    title: "Beginner Guide",
    href: "/beginner-guide",
    description: "Get started fast — character creation, DG levels, first-day priorities, and how to earn gold quickly.",
    priority: "P0",
  },
  {
    title: "Redeem Codes",
    href: "/codes",
    description: "All active Heartopia gift codes. Moonlight Crystals, Wishing Stars, and free materials — updated regularly.",
    priority: "P0",
  },
  {
    title: "Main Walkthrough",
    href: "/walkthrough",
    description: "Complete Astralis quest chain: Forest → Fishing Village → Flower Field → Onsen Mountain.",
    priority: "P0",
  },
  {
    title: "Characters & NPCs",
    href: "/characters",
    description: "Every NPC's location, role, unlock condition, and shop inventory — from Vanya to Doris.",
    priority: "P1",
  },
  {
    title: "Resources",
    href: "/resources",
    description: "Where to find every material: timber types, ores, foraged ingredients, and rare items like Flawless Fluorite.",
    priority: "P1",
  },
  {
    title: "Hobbies",
    href: "/hobbies",
    description: "Fishing, gardening, cooking, bug catching, birdwatching, and pet care — unlock guides and best strategies.",
    priority: "P2",
  },
  {
    title: "Crafting",
    href: "/crafting",
    description: "All crafting recipes with required materials — repair kits, furniture, bait, fertilizer, and special items.",
    priority: "P2",
  },
  {
    title: "Building & Decor",
    href: "/building",
    description: "Blueprints, co-building, custom furniture tricks, wallpaper hacks, and advanced decoration techniques.",
    priority: "P3",
  },
  {
    title: "Events",
    href: "/events",
    description: "Limited-time event guides: Winter Frost, Beaver Build Challenge, Wonder Egg Hunt, and seasonal activities.",
    priority: "P3",
  },
  {
    title: "Multiplayer",
    href: "/multiplayer",
    description: "Friends system, Coffee Umbrella social spots, cross-platform play, and co-building explained.",
    priority: "P3",
  },
];
