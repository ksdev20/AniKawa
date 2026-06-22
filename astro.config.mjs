// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import vercelAdapter from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    adapter: vercelAdapter(),
    integrations: [react(), mdx()],
    output: 'server',
    devToolbar: {
        enabled: false
    },
    vite: {
        plugins: [tailwindcss()],
    }
});