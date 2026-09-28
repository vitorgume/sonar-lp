interface ImportMetaEnv {
  /** URL que recebe o POST (JSON) com os dados do lead: webhook do CRM, n8n, Make, RD Station etc. */
  readonly PUBLIC_LEAD_ENDPOINT?: string;
  /** Container do Google Tag Manager (ex.: GTM-XXXXXXX). Vazio = sem tag. */
  readonly PUBLIC_GTM_ID?: string;
  /** Número do WhatsApp comercial, só dígitos com DDI (ex.: 5511912345678). Vazio = oculta o botão. */
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
