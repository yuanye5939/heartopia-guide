import { defineCollection, z } from "astro:content";

const guideCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "beginner-guide",
      "codes",
      "walkthrough",
      "characters",
      "resources",
      "hobbies",
      "crafting",
      "building",
      "events",
      "multiplayer",
    ]),
    priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
    lang: z.enum(["en", "de", "it", "fr", "es", "ja", "ko", "id", "pl"]).default("en"),
    ogImage: z.string().optional(),
    updatedAt: z.date().optional(),
  }),
});

export const collections = {
  guide: guideCollection,
};
