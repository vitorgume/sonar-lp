# Sonar — Landing Page de captação de leads

Landing page (Astro 7 + Tailwind CSS 4) para receber o tráfego das campanhas de marketing e entregar os leads ao time comercial via n8n.
A LP **não** cria conta nem faz login no Sonar, e não oferece outro canal de contato: o único caminho é o formulário.

## Arquitetura

- Todas as páginas são **pré-renderizadas** (HTML estático, bom para SEO).
- Só a rota `POST /api/lead` roda no servidor (adapter `@astrojs/node`, modo standalone). Ela valida o lead e repassa ao
  webhook do n8n com o header `atkey`. Assim a URL do webhook e a chave **nunca chegam ao navegador**.

## Rodando

```bash
npm install
npm run dev        # http://localhost:4321 (a rota /api/lead também funciona em dev)
npm run build      # gera dist/client (estático) e dist/server (Node)
npm start          # sobe o servidor de produção a partir do dist
npm run check      # checagem de tipos (astro check)
npm run images     # regera og-image.png, logo.png e apple-touch-icon.png em /public
```

Em `dev`, a rota lê o `.env` local. **Atenção:** com o `.env` preenchido, enviar o formulário em dev cria um lead real no n8n.

## Variáveis de ambiente

Copie `.env.example` para `.env` localmente; em produção, configure no Render.

| Variável | Quando é lida | Uso |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | Em execução (servidor) | URL do webhook do n8n que recebe o lead. |
| `N8N_WEBHOOK_ATKEY` | Em execução (servidor) | Valor enviado no header `atkey` para autenticar no n8n. |
| `SITE_URL` | No build | Domínio final: canonical, Open Graph, sitemap e robots.txt. |
| `PUBLIC_GTM_ID` | No build | Opcional. Container do Google Tag Manager. |
| `HOST` / `PORT` | Em execução | No Render: `HOST=0.0.0.0`; o `PORT` o próprio Render define. |

Sem `N8N_WEBHOOK_URL` ou `N8N_WEBHOOK_ATKEY`, a rota responde `503` e o formulário mostra mensagem de erro.
Trocar essas duas variáveis no Render não exige novo build — basta reiniciar o serviço.

## Deploy no Render

O repositório tem um `render.yaml` (Blueprint). Manualmente, crie um **Web Service** (não Static Site):

- **Runtime:** Node
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Environment:** `HOST=0.0.0.0`, `SITE_URL`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_ATKEY` (e `PUBLIC_GTM_ID`, se usar)

> No plano gratuito do Render o serviço "dorme" após ~15 min sem acesso e a primeira visita pode levar quase um minuto
> para responder — com tráfego pago isso derruba conversão. Use um plano pago (o `render.yaml` já vem com `starter`).

## Payload enviado ao n8n

`POST` em `N8N_WEBHOOK_URL`, com headers `Content-Type: application/json` e `atkey: <N8N_WEBHOOK_ATKEY>`:

```json
{
  "nome": "João da Silva",
  "telefone": "11987654321",
  "email": "joao@empresa.com.br",
  "cargo": "Gerente comercial",
  "empresa": "Empresa Ltda",
  "consentimentoLgpd": true,
  "origem": {
    "utm_source": "meta",
    "utm_medium": "paid-social",
    "utm_campaign": "lancamento-sonar",
    "utm_term": "",
    "utm_content": "video-01",
    "gclid": "",
    "fbclid": "...",
    "referrer": "https://www.instagram.com/",
    "landingPage": "https://sonarbiz.com.br/?utm_source=meta&..."
  },
  "enviadoEm": "2026-09-28T18:39:25.615Z"
}
```

- `email` em minúsculas; `telefone` só com dígitos (DDD + número); `cargo` é texto livre.
- O servidor remonta o lead campo a campo: qualquer campo extra enviado pelo navegador é descartado.
- `enviadoEm` é gerado no servidor.
- As UTMs ficam guardadas na sessão do navegador: se o visitante recarregar a página, a origem da campanha continua no lead.

## Medição de conversão

- Envio com sucesso → evento `generate_lead` no `dataLayer` (com `utm_source` e `utm_campaign`) e redirecionamento para `/obrigado`.
- Cliques nos CTAs → evento `cta_click` com `cta_location` (`header`, `showcase`, `meio`, `barra-mobile`, `rodape`).
- `/obrigado` tem `noindex` e fica fora do sitemap — pode ser usada como URL de conversão no Google Ads / Meta Ads.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Textos e copy de todas as seções e FAQ | `src/data/content.ts` |
| Título/descrição de SEO, razão social, e-mail de privacidade | `src/data/site.ts` |
| Campos do formulário | `src/components/LeadForm.astro` |
| Validação e máscara de telefone no navegador | `src/scripts/lead-form.ts` |
| Validação no servidor e envio ao n8n | `src/pages/api/lead.ts` |
| Classes do Design System (botões, inputs, cards) | `src/styles/ui.ts` |
| Ordem das seções | `src/pages/index.astro` |
| Política de privacidade | `src/pages/politica-de-privacidade.astro` |

## SEO

HTML pré-renderizado com CSS inline, fonte Inter self-hosted com preload, ~4 KB de JavaScript (só o formulário),
um único `h1`, canonical, Open Graph/Twitter Card, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`),
`sitemap-index.xml` e `robots.txt`.
