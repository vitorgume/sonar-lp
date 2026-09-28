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
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/obrigado') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
