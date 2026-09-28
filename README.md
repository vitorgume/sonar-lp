# Sonar — Landing Page de captação de leads

Página estática (Astro 7 + Tailwind CSS 4) para receber o tráfego das campanhas de marketing e entregar os leads ao time comercial.
A LP **não** cria conta nem faz login no Sonar: o único objetivo é o formulário de demonstração.

## Rodando

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera /dist (HTML estático)
npm run preview    # serve o /dist localmente
npm run check      # checagem de tipos (astro check)
npm run images     # regera og-image.png, logo.png e apple-touch-icon.png em /public
```

Em `dev`, sem `PUBLIC_LEAD_ENDPOINT`, o envio do formulário é simulado para permitir testar o fluxo até a página de obrigado.
Em produção, sem endpoint, o formulário mostra erro — configure antes de subir a campanha.

## Variáveis de ambiente

Copie `.env.example` para `.env` (ou configure no provedor de hospedagem):

| Variável | Uso |
| --- | --- |
| `SITE_URL` | Domínio final. Alimenta canonical, Open Graph, sitemap e robots.txt. |
| `PUBLIC_LEAD_ENDPOINT` | URL que recebe o `POST` JSON do lead (webhook do CRM, n8n, Make, RD Station...). Precisa responder CORS para o domínio da LP. |
| `PUBLIC_GTM_ID` | Opcional. Container do Google Tag Manager. |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp comercial, só dígitos com DDI. |

As variáveis `PUBLIC_*` são embutidas no build — alterou, rode o build de novo.

## Payload enviado pelo formulário

```json
{
  "nome": "João da Silva",
  "email": "joao@empresa.com.br",
  "telefone": "11987654321",
  "empresa": "Empresa Ltda",
  "cargo": "gerente-coordenador-vendas",
  "tamanhoEquipe": "16-50",
  "crm": "pipedrive",
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

- `email` chega em minúsculas; `telefone` só com dígitos (DDD + número).
- `crm` é opcional (string vazia quando não informado).
- As UTMs são guardadas na sessão do navegador: se o visitante recarregar a página, a origem da campanha continua no lead.
- Os valores possíveis de `cargo`, `tamanhoEquipe` e `crm` estão em `src/data/content.ts` (`leadForm`).

## Medição de conversão

- Envio com sucesso → evento `generate_lead` no `dataLayer` (com cargo, tamanho do time, CRM, `utm_source` e `utm_campaign`) e redirecionamento para `/obrigado`.
- Cliques nos CTAs → evento `cta_click` com `cta_location` (`header`, `showcase`, `meio`, `barra-mobile`, `rodape`, `whatsapp-final`, `whatsapp-obrigado`).
- `/obrigado` tem `noindex` e fica fora do sitemap — pode ser usada como URL de conversão no Google Ads / Meta Ads.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Textos e copy de todas as seções, FAQ e opções do formulário | `src/data/content.ts` |
| Título/descrição de SEO, razão social, e-mail de privacidade, WhatsApp | `src/data/site.ts` |
| Classes do Design System (botões, inputs, cards) | `src/styles/ui.ts` |
| Ordem das seções | `src/pages/index.astro` |
| Envio do formulário, validação e máscara de telefone | `src/scripts/lead-form.ts` |
| Política de privacidade | `src/pages/politica-de-privacidade.astro` |

## SEO

HTML 100% estático com CSS inline, fonte Inter self-hosted com preload, ~4 KB de JavaScript (só o formulário),
um único `h1`, canonical, Open Graph/Twitter Card, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`),
`sitemap-index.xml` e `robots.txt` gerados no build.

## Deploy

Qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront): comando `npm run build`, diretório `dist`.
