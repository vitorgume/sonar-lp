import type { APIRoute } from 'astro';
import { N8N_WEBHOOK_ATKEY, N8N_WEBHOOK_URL } from 'astro:env/server';
import {
  isPainKey,
  isTeamSize,
  pains,
  quizLevels,
  roleOptions,
  type LeadInterest,
  type QuizLevel,
  type TeamSize,
} from '../../data/raio-x';

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
  /** WhatsApp com DDD, só dígitos. */
  telefone: string;
  empresa: string;
  cargo: string;
  tamanhoTimeComercial: TeamSize;
  interesse: LeadInterest;
  /** Dor escolhida na página, por extenso (ex.: "A meta não fecha"). */
  dor: string;
  resultadoTeste: QuizLevel | '';
  ctaOrigem: string;
  consentimentoLgpd: boolean;
  origem: LeadAttribution;
  enviadoEm: string;
}

const UPSTREAM_TIMEOUT_MS = 10_000;
const INTERESTS: LeadInterest[] = ['raio-x', 'video'];
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

/**
 * Remonta o lead campo a campo a partir do corpo recebido: nada que o navegador mande além do
 * contrato chega ao n8n, e os limites de tamanho valem mesmo para quem chamar a rota sem o formulário.
 * Campos de lista fechada (cargo, tamanho, interesse, dor, teste) só aceitam os valores da própria LP.
 */
function parseLead(body: unknown): LeadPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const input = body as Record<string, unknown>;
  const rawOrigem = (typeof input.origem === 'object' && input.origem !== null ? input.origem : {}) as Record<string, unknown>;

  const cargo = text(input.cargo, 120);
  const tamanho = input.tamanhoTimeComercial;
  const interesse = input.interesse;
  const dor = input.dor;
  const resultadoTeste = text(input.resultadoTeste, 20);

  if (
    !roleOptions.includes(cargo) ||
    !isTeamSize(tamanho) ||
    !INTERESTS.includes(interesse as LeadInterest) ||
    !isPainKey(dor) ||
    (resultadoTeste !== '' && !quizLevels.includes(resultadoTeste as QuizLevel)) ||
    input.consentimentoLgpd !== true
  ) {
    return null;
  }

  const lead: LeadPayload = {
    nome: text(input.nome, 120),
    telefone: text(input.telefone, 20).replace(/\D/g, ''),
    empresa: text(input.empresa, 120),
    cargo,
    tamanhoTimeComercial: tamanho,
    interesse: interesse as LeadInterest,
    dor: pains[dor].label,
    resultadoTeste: resultadoTeste as QuizLevel | '',
    ctaOrigem: text(input.ctaOrigem, 60),
    consentimentoLgpd: true,
    origem: Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, text(rawOrigem[key], 500)])) as unknown as LeadAttribution,
    enviadoEm: new Date().toISOString(),
  };

  const valid =
    lead.nome.length >= 2 &&
    lead.telefone.length >= 10 &&
    lead.telefone.length <= 11 &&
    lead.empresa.length >= 2;

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
