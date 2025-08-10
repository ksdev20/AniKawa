// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    output: 'server',
    devToolbar: {
        enabled: false
    },
    vite: {
        define: {
            'import.meta.env.PUBLIC_BACKEND_URL': JSON.stringify(process.env.PUBLIC_BACKEND_URL)
        }
    }
});