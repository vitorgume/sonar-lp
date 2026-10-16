// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

export default defineConfig({
  site: SITE_URL || 'https://lp.sonarbiz.com.br',
  trailingSlash: 'ignore',
  compressHTML: true,
  // As páginas continuam pré-renderizadas (HTML estático para SEO); só `/api/lead` roda no servidor,
  // para que a URL e a chave do webhook do n8n nunca cheguem ao navegador.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  build: {
    inlineStylesheets: 'always',
  },
  env: {
    schema: {
      N8N_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true, url: true }),
      N8N_WEBHOOK_ATKEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_META_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Segoe UI', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
