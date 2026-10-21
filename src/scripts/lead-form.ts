import { isEmail, isTeamSize, type LeadInterest, type TeamSize } from '../data/raio-x';
import { track } from './analytics';
import { resolveAttribution, type LeadAttribution } from './attribution';
import { leadContext } from './lead-context';

export interface LeadPayload {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  tamanhoTimeComercial: TeamSize;
  interesse: LeadInterest;
  dor: string;
  resultadoTeste: string;
  ctaOrigem: string;
  consentimentoLgpd: boolean;
  origem: LeadAttribution;
}

export interface SubmittedLead {
  payload: LeadPayload;
  formLocation: string;
}

interface LeadFormOptions {
  interest: LeadInterest;
  /** Botão que abriu o modal (hero, oferta, barra-mobile…). Lido no momento do envio. */
  ctaOrigin: () => string;
  onSuccess: (lead: SubmittedLead) => void;
}

// Rota do próprio site: ela é quem repassa ao n8n com a chave de autenticação, que nunca vem ao navegador.
const LEAD_ENDPOINT = '/api/lead';

// Se o /api/lead (ou o n8n por trás dele) travar, o visitante não fica preso no "Enviando…" para sempre.
// O envio normal leva cerca de 1,5 s; 20 s cobre conexões móveis lentas com folga.
const SUBMIT_TIMEOUT_MS = 20_000;

type SubmitFailureKind = 'http' | 'network' | 'timeout';

class LeadSubmitError extends Error {
  readonly kind: SubmitFailureKind;
  readonly status?: number;

  constructor(kind: SubmitFailureKind, status?: number) {
    super(`Falha ao enviar lead: ${kind}${status ? ` ${status}` : ''}`);
    this.kind = kind;
    this.status = status;
  }
}

const attribution = resolveAttribution();

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface FieldCheck {
  name: string;
  /** Como o campo aparece em "Falta preencher: …". */
  label: string;
  valid: (data: FormData) => boolean;
}

const textOf = (data: FormData, key: string): string => String(data.get(key) ?? '').trim();
const digitsOf = (data: FormData, key: string): string => textOf(data, key).replace(/\D/g, '');

// Mesmas regras da rota /api/lead: o que passa aqui, passa lá.
const FIELD_CHECKS: FieldCheck[] = [
  { name: 'nome', label: 'nome', valid: (data) => textOf(data, 'nome').length >= 2 },
  { name: 'email', label: 'e-mail', valid: (data) => isEmail(textOf(data, 'email')) },
  {
    name: 'whatsapp',
    label: 'WhatsApp com DDD',
    valid: (data) => digitsOf(data, 'whatsapp').length >= 10 && digitsOf(data, 'whatsapp').length <= 11,
  },
  { name: 'empresa', label: 'empresa', valid: (data) => textOf(data, 'empresa').length >= 2 },
  { name: 'cargo', label: 'cargo', valid: (data) => textOf(data, 'cargo') !== '' },
  { name: 'tamanho', label: 'quantos vendedores', valid: (data) => isTeamSize(data.get('tamanho')) },
];

function buildPayload(data: FormData, interest: LeadInterest, ctaOrigin: string): LeadPayload {
  return {
    nome: textOf(data, 'nome'),
    email: textOf(data, 'email').toLowerCase(),
    telefone: digitsOf(data, 'whatsapp'),
    empresa: textOf(data, 'empresa'),
    cargo: textOf(data, 'cargo'),
    tamanhoTimeComercial: textOf(data, 'tamanho') as TeamSize,
    interesse: interest,
    dor: leadContext.pain,
    resultadoTeste: leadContext.quizLevel,
    ctaOrigem: ctaOrigin,
    // O aceite é o próprio envio: o formulário avisa "Ao continuar, você concorda com a Política de Privacidade".
    consentimentoLgpd: true,
    origem: attribution,
  };
}

async function sendLead(payload: LeadPayload): Promise<void> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) throw new LeadSubmitError('http', response.status);
  } catch (error) {
    if (error instanceof LeadSubmitError) throw error;
    throw new LeadSubmitError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    window.clearTimeout(timer);
  }
}

function trackConversion({ payload, formLocation }: SubmittedLead): void {
  track('generate_lead', {
    form_location: formLocation,
    interesse: payload.interesse,
    tamanho: payload.tamanhoTimeComercial,
    cargo: payload.cargo,
    dor: payload.dor,
    cta_location: payload.ctaOrigem,
    utm_source: payload.origem.utm_source,
    utm_campaign: payload.origem.utm_campaign,
  });

  // Evento padrão "Lead" do Pixel da Meta: é ele que a campanha usa para otimizar.
  // Fica aqui para disparar só depois que o envio deu certo.
  // Os eventos de diagnóstico vão só para o GA4, de propósito: na Meta eles poluiriam o conjunto de dados.
  window.fbq?.('track', 'Lead', { content_name: payload.interesse });
}

export function initLeadForm(form: HTMLFormElement, options: LeadFormOptions): void {
  const formLocation = `modal-${options.interest}`;
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const submitLoading = form.querySelector<HTMLElement>('[data-submit-loading]');
  const errorEl = form.querySelector<HTMLElement>('[data-form-error]');
  const phoneInput = form.querySelector<HTMLInputElement>('input[name="whatsapp"]');

  let started = false;
  let attempts = 0;
  let submitting = false;

  // Conta como início só quando o visitante digita ou marca algo (inclui o preenchimento automático).
  const markStarted = (event: Event): void => {
    const target = event.target;
    if (started || !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.name === 'website') return;
    started = true;
    track('lead_form_start', { form_location: formLocation, field_name: target.name });
  };
  form.addEventListener('input', markStarted);
  form.addEventListener('change', markStarted);

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  const showError = (message: string): void => {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
  };

  const markInvalid = (invalidNames: string[]): void => {
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]').forEach((field) => {
      if (field.type === 'radio' || field.type === 'hidden' || field.name === 'website') return;
      field.setAttribute('aria-invalid', String(invalidNames.includes(field.name)));
    });
  };

  // Corrigiu um campo: tira o destaque de erro dele sem esperar outro envio.
  form.addEventListener('input', (event) => {
    const field = event.target as HTMLElement;
    if (field.getAttribute('aria-invalid') === 'true') field.setAttribute('aria-invalid', 'false');
  });
  form.addEventListener('change', (event) => {
    const field = event.target as HTMLElement;
    if (field.getAttribute('aria-invalid') === 'true') field.setAttribute('aria-invalid', 'false');
  });

  const setSubmitting = (value: boolean): void => {
    submitting = value;
    if (submitButton) submitButton.disabled = value;
    submitLabel?.toggleAttribute('hidden', value);
    submitLoading?.toggleAttribute('hidden', !value);
    form.setAttribute('aria-busy', String(value));
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    showError('');

    attempts += 1;
    const attempt = attempts;
    track('lead_form_submit_attempt', { form_location: formLocation, attempt });

    // Bots preenchem o campo invisível. Se um visitante real cair aqui (autopreenchimento de algum
    // gerenciador de senhas, por exemplo), o botão "não faz nada" — o evento deixa isso visível.
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot?.value) {
      track('lead_form_honeypot', { form_location: formLocation, attempt });
      return;
    }

    const data = new FormData(form);
    const failing = FIELD_CHECKS.filter((check) => !check.valid(data));
    markInvalid(failing.map((check) => check.name));
    if (failing.length > 0) {
      failing.forEach((check) =>
        track('lead_form_validation_error', { form_location: formLocation, field_name: check.name, attempt }),
      );
      showError(`Falta preencher: ${failing.map((check) => check.label).join(', ')}.`);
      const first = failing[0]!.name === 'tamanho' ? 'input[name="tamanho"]' : `[name="${failing[0]!.name}"]`;
      form.querySelector<HTMLElement>(first)?.focus();
      return;
    }

    const payload = buildPayload(data, options.interest, options.ctaOrigin());
    setSubmitting(true);

    try {
      await sendLead(payload);
    } catch (error) {
      const failure = error instanceof LeadSubmitError ? error : undefined;
      track('lead_form_api_error', {
        form_location: formLocation,
        error_kind: failure?.kind ?? 'unknown',
        http_status: failure?.status,
        attempt,
      });
      setSubmitting(false);
      showError('Não conseguimos enviar seus dados agora. Confira sua conexão e tente novamente em instantes.');
      return;
    }

    // Fora do try: o lead já foi gravado, então nada daqui pode mostrar a mensagem de erro
    // e levar o visitante a enviar de novo (o que duplicaria o lead no n8n).
    setSubmitting(false);
    const lead = { payload, formLocation };
    trackConversion(lead);
    options.onSuccess(lead);
  });
}
