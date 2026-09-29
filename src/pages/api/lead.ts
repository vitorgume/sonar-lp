import type { APIRoute } from 'astro';
import { N8N_WEBHOOK_ATKEY, N8N_WEBHOOK_URL } from 'astro:env/server';

export const prerender = false;

interface LeadAttribution {
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

interface LeadPayload {
  nome: string;
  telefone: string;
  email: string;
  cargo: string;
  empresa: string;
  tamanhoTimeComercial: number;
  consentimentoLgpd: boolean;
  origem: LeadAttribution;
  enviadoEm: string;
}

const UPSTREAM_TIMEOUT_MS = 10_000;
const TEAM_SIZE_MIN = 1;
const TEAM_SIZE_MAX = 9999;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTRIBUTION_KEYS: (keyof LeadAttribution)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'referrer',
  'landingPage',
];

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Aceita número ou texto só com dígitos; qualquer outra coisa (decimal, notação científica, vazio) vira NaN. */
function wholeNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isInteger(value) ? value : Number.NaN;
  if (typeof value === 'string' && /^\d{1,6}$/.test(value.trim())) return Number(value.trim());
  return Number.NaN;
}

/**
 * Remonta o lead campo a campo a partir do corpo recebido: nada que o navegador mande além do
 * contrato chega ao n8n, e os limites de tamanho valem mesmo para quem chamar a rota sem o formulário.
 */
function parseLead(body: unknown): LeadPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const input = body as Record<string, unknown>;
  const rawOrigem = (typeof input.origem === 'object' && input.origem !== null ? input.origem : {}) as Record<string, unknown>;

  const lead: LeadPayload = {
    nome: text(input.nome, 120),
    telefone: text(input.telefone, 20).replace(/\D/g, ''),
    email: text(input.email, 160).toLowerCase(),
    cargo: text(input.cargo, 120),
    empresa: text(input.empresa, 120),
    tamanhoTimeComercial: wholeNumber(input.tamanhoTimeComercial),
    consentimentoLgpd: input.consentimentoLgpd === true,
    origem: Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, text(rawOrigem[key], 500)])) as unknown as LeadAttribution,
    enviadoEm: new Date().toISOString(),
  };

  const valid =
    lead.nome.length >= 3 &&
    lead.telefone.length >= 10 &&
    lead.telefone.length <= 11 &&
    EMAIL_PATTERN.test(lead.email) &&
    lead.cargo.length >= 2 &&
    lead.empresa.length >= 2 &&
    lead.tamanhoTimeComercial >= TEAM_SIZE_MIN &&
    lead.tamanhoTimeComercial <= TEAM_SIZE_MAX &&
    lead.consentimentoLgpd;

  return valid ? lead : null;
}

export const POST: APIRoute = async ({ request }) => {
  if (!N8N_WEBHOOK_URL || !N8N_WEBHOOK_ATKEY) {
    console.error('[api/lead] N8N_WEBHOOK_URL ou N8N_WEBHOOK_ATKEY não configurados.');
    return json(503, { ok: false, error: 'lead_destination_not_configured' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  const lead = parseLead(body);
  if (!lead) {
    return json(400, { ok: false, error: 'invalid_lead' });
  }

  try {
    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        atkey: N8N_WEBHOOK_ATKEY,
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 500);
      console.error(`[api/lead] n8n respondeu HTTP ${upstream.status}: ${detail}`);
      return json(502, { ok: false, error: 'lead_destination_error' });
    }
  } catch (error) {
    console.error('[api/lead] Falha ao chamar o n8n:', error instanceof Error ? error.message : error);
    return json(502, { ok: false, error: 'lead_destination_unreachable' });
  }

  return json(200, { ok: true });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });
