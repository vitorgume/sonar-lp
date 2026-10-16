type DataLayerEvent = Record<string, unknown>;
export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Ponto único de envio de eventos: dataLayer (GTM) e GA4 direto pelo gtag.
 * Se algum evento aparecer duplicado, a correção é feita só aqui.
 * Nunca enviar valores digitados pelo visitante (nome, telefone, empresa) nos parâmetros: LGPD e termos do GA4.
 */
export function track(name: string, params: AnalyticsParams = {}): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });

  // O gtag.js não lê os objetos que o GTM consome no dataLayer, então o GA4 recebe o evento direto.
  window.gtag?.('event', name, params);
}

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
