import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string(),

    subTitle: z.string(),

    author: z.string(),

    date: z.coerce.string(),

    img: z.string(),

    imgLarge: z.string().optional(),

    imgPortrait: z.string().optional(),

    categoryList: z.array(z.string()),

    slug: z.string(),

    readMinutes: z.number().optional(),

    toc: z
      .array(
        z.object({
          text: z.string(),
          link: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = {
  blog,
};