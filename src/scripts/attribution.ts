import { ATTRIBUTION_KEY as STORAGE_KEY } from './storage-keys';

export interface LeadAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
  referrer: string;
  landingPage: string;
}

const TRACKED_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

function readStored(): LeadAttribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LeadAttribution) : null;
  } catch {
    return null;
  }
}

function store(attribution: LeadAttribution): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage bloqueado (aba anônima/cookies desativados): a atribuição segue só em memória.
  }
}

function fromCurrentUrl(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);
  const tracked = Object.fromEntries(
    TRACKED_PARAMS.map((key) => [key, params.get(key) ?? '']),
  ) as Record<(typeof TRACKED_PARAMS)[number], string>;

  return {
    ...tracked,
    referrer: document.referrer,
    landingPage: window.location.href,
  };
}

function hasCampaignData(attribution: LeadAttribution): boolean {
  return TRACKED_PARAMS.some((key) => attribution[key] !== '');
}

/**
 * Primeiro toque da sessão vence: se o visitante chegou por uma campanha e recarregou a página
 * (ou navegou pelas âncoras), os parâmetros originais continuam valendo. Uma nova URL com UTM
 * substitui a anterior, porque indica um novo clique em anúncio.
 */
export function resolveAttribution(): LeadAttribution {
  const current = fromCurrentUrl();
  const stored = readStored();

  if (hasCampaignData(current) || !stored) {
    store(current);
    return current;
  }

  return stored;
}
