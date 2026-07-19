// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercelAdapter from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  adapter: vercelAdapter(),
  integrations: [
    react(),
    mdx(),
    sentry({
      project: "javascript-astro",
      org: "anikawa",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  output: "server",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
