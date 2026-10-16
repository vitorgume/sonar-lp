# Sonar — Landing Page de captação de leads

Landing page (Astro 7, design "Sonar Raio-X" do Marketing) para receber o tráfego das campanhas de marketing e entregar os leads ao time comercial via n8n.
A LP **não** cria conta nem faz login no Sonar, e não oferece outro canal de contato: o único caminho é o formulário (o time comercial retorna pelo WhatsApp).

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
| `PUBLIC_GA_ID` | No build | Opcional. ID de métricas do Google Analytics 4 (`G-XXXXXXXXXX`). Não use junto com uma tag GA4 no GTM. |
| `PUBLIC_META_PIXEL_ID` | No build | Opcional. ID do Pixel da Meta. |
| `HOST` / `PORT` | Em execução | No Render: `HOST=0.0.0.0`; o `PORT` o próprio Render define. |

Sem `N8N_WEBHOOK_URL` ou `N8N_WEBHOOK_ATKEY`, a rota responde `503` e o formulário mostra mensagem de erro.
Trocar essas duas variáveis no Render não exige novo build — basta reiniciar o serviço.

## Deploy no Render

O repositório tem um `render.yaml` (Blueprint). Manualmente, crie um **Web Service** (não Static Site):

- **Runtime:** Node
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Environment:** `HOST=0.0.0.0`, `SITE_URL`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_ATKEY` (e `PUBLIC_GTM_ID`, `PUBLIC_GA_ID`, `PUBLIC_META_PIXEL_ID`, se usar)

> No plano gratuito do Render o serviço "dorme" após ~15 min sem acesso e a primeira visita pode levar quase um minuto
> para responder — com tráfego pago isso derruba conversão. Use um plano pago (o `render.yaml` já vem com `starter`).

## Payload enviado ao n8n

`POST` em `N8N_WEBHOOK_URL`, com headers `Content-Type: application/json` e `atkey: <N8N_WEBHOOK_ATKEY>`:

```json
{
  "nome": "João da Silva",
  "telefone": "11987654321",
  "empresa": "Empresa Ltda",
  "cargo": "Gerente ou coordenador comercial",
  "tamanhoTimeComercial": "4-10",
  "interesse": "raio-x",
  "dor": "A meta não fecha",
  "resultadoTeste": "parcial",
  "ctaOrigem": "hero",
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
    "landingPage": "https://lp.sonarbiz.com.br/?utm_source=meta&..."
  },
  "enviadoEm": "2026-10-15T18:39:25.615Z"
}
```

- `telefone` é o **WhatsApp** informado, só com dígitos (DDD + número). O formulário não pede e-mail.
- `cargo` é uma das opções da lista do formulário (`roleOptions` em `src/data/raio-x.ts`).
- `tamanhoTimeComercial` é uma faixa, enviada como texto: `"1-3"`, `"4-10"`, `"11-30"` ou `"30+"`.
- `interesse`: `"raio-x"` (pediu o Raio-X das Ligações, a conversa com especialista) ou `"video"` (preencheu para assistir à demonstração gravada).
- `dor`: o desafio que o visitante marcou na página, por extenso (padrão: "A meta não fecha").
- `resultadoTeste`: resultado do teste do ponto cego — `"grande"`, `"parcial"`, `"boa"` ou vazio se não fez o teste.
- `ctaOrigem`: botão que abriu o formulário (`header`, `hero`, `relatorio-bloqueado`, `dor`, `cena`, `teste`, `oferta`, `final`, `barra-mobile`, `convite-saida`, `pos-video`).
- `consentimentoLgpd` é sempre `true`: o envio é o aceite (o formulário avisa "Ao continuar, você concorda com a Política de Privacidade").
- O servidor remonta o lead campo a campo: qualquer campo extra enviado pelo navegador é descartado, e campos de lista fechada só aceitam os valores da LP.
- `enviadoEm` é gerado no servidor.
- As UTMs ficam guardadas na sessão do navegador: se o visitante recarregar a página, a origem da campanha continua no lead.
- O mesmo visitante pode gerar dois leads na visita: primeiro `video` e depois `raio-x` (o botão "Quero meu Raio-X" depois do vídeo abre o pedido já preenchido).

## Fluxo do formulário

Os CTAs abrem um modal com duas portas:

- **Porta A — Raio-X** (`interesse: "raio-x"`): dados → confirmação "Pedido recebido". Times de 1 a 3 vendedores recebem a sugestão
  de assistir à demonstração gravada (o lead já foi enviado).
- **Porta B — Vídeo** (`interesse: "video"`): dados → libera `public/demo-gravada.mp4`.

Não há mais redirecionamento para `/obrigado`: a confirmação acontece dentro do modal.

## Medição de conversão

Todos os eventos vão para o `dataLayer` (GTM) e direto para o GA4 via `gtag` (`src/scripts/analytics.ts`).

- Envio com sucesso → `generate_lead` (com `interesse`, `tamanho`, `cargo`, `dor`, `cta_location`, `utm_source`, `utm_campaign`)
  e evento padrão `Lead` do Pixel da Meta (com `content_name` = `raio-x` ou `video`).
- Abertura do modal → `cta_click` com `cta_location` (origem do botão) e `porta` (`A` ou `B`).
- Formulário → `lead_form_start`, `lead_form_submit_attempt`, `lead_form_validation_error`, `lead_form_api_error`, `lead_form_honeypot`.
- Interações da página → `dor_escolhida`, `cena_resposta`, `teste_iniciado`, `teste_concluido`, `pediu_especialista`,
  `video_demo_play`, `convite_saida_exibido`, `logos_arrastadas`.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Dores, relatório de exemplo, cena, teste, opções de cargo e tamanho do time | `src/data/raio-x.ts` |
| Topo, prova, oferta, "por que funciona", FAQ e logos de clientes | `src/data/content.ts` |
| Título/descrição de SEO, razão social, e-mail de privacidade, menu | `src/data/site.ts` |
| Estilos do design (cores, tipografia, componentes) | `src/styles/raio-x.css` |
| Campos do formulário | `src/components/LeadFields.astro` |
| Passos do modal, vídeo e convite de saída | `src/components/LeadModal.astro` e `src/scripts/lead-modal.ts` |
| Validação, máscara de WhatsApp e envio no navegador | `src/scripts/lead-form.ts` |
| Validação no servidor e envio ao n8n | `src/pages/api/lead.ts` |
| Ordem das seções | `src/pages/index.astro` |
| Logos de clientes | `src/assets/clients/` (PNG brancos, fundo transparente) |
| Vídeo da demonstração e capa | `public/demo-gravada.mp4` e `public/poster-demo.jpg` |
| Política de privacidade | `src/pages/politica-de-privacidade.astro` |

## SEO

HTML pré-renderizado com CSS inline, fontes Manrope e IBM Plex Mono self-hosted (Manrope com preload), logos otimizados em WebP,
um único `h1`, canonical, Open Graph/Twitter Card, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`),
`sitemap-index.xml` e `robots.txt`.
