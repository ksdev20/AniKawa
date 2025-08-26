// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import vercelAdapter from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    adapter: vercelAdapter(),
    integrations: [react()],
    output: 'server',
    devToolbar: {
        enabled: false
    },
    vite: {
        plugins: [tailwindcss()],
    }
});