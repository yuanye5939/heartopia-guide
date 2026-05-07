import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://heartopia.guide",
  integrations: [
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "it", "fr", "es", "ja", "ko", "id", "pl"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
