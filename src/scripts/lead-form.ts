import { resolveAttribution, type LeadAttribution } from './attribution';
import { FIRST_NAME_KEY } from './storage-keys';

interface LeadPayload {
  nome: string;
  telefone: string;
  email: string;
  cargo: string;
  empresa: string;
  tamanhoTimeComercial: number;
  consentimentoLgpd: boolean;
  origem: LeadAttribution;
}

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    fbq?: (...args: unknown[]) => void;
  }
}

// Rota do próprio site: ela é quem repassa ao n8n com a chave de autenticação, que nunca vem ao navegador.
const LEAD_ENDPOINT = '/api/lead';
const THANK_YOU_PATH = '/obrigado';

const FIELD_MESSAGES: Record<string, Partial<Record<keyof ValidityState, string>>> = {
  nome: { valueMissing: 'Informe seu nome.', tooShort: 'Digite seu nome completo.' },
  telefone: {
    valueMissing: 'Informe seu telefone.',
    patternMismatch: 'Digite o número com DDD, como (11) 91234-5678.',
  },
  email: {
    valueMissing: 'Informe seu e-mail.',
    typeMismatch: 'Digite um e-mail válido, como nome@empresa.com.br.',
  },
  cargo: { valueMissing: 'Informe seu cargo.', tooShort: 'Informe seu cargo.' },
  empresa: { valueMissing: 'Informe o nome da empresa.', tooShort: 'Informe o nome da empresa.' },
  tamanhoTimeComercial: {
    valueMissing: 'Informe quantas pessoas tem no time comercial.',
    badInput: 'Digite apenas números.',
    stepMismatch: 'Digite um número inteiro.',
    rangeUnderflow: 'Informe pelo menos 1 pessoa.',
    rangeOverflow: 'Informe um número de até 9999.',
  },
  consentimentoLgpd: { valueMissing: 'Precisamos do seu aceite para entrar em contato.' },
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function messageFor(field: HTMLInputElement): string {
  const messages = FIELD_MESSAGES[field.name] ?? {};
  const failing = (Object.keys(messages) as (keyof ValidityState)[]).find((key) => field.validity[key]);
  return failing ? (messages[failing] ?? field.validationMessage) : field.validationMessage;
}

function setFieldError(field: HTMLInputElement, message: string): void {
  const errorEl = document.getElementById(`${field.id}-erro`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }
}

function validateField(field: HTMLInputElement): boolean {
  const valid = field.checkValidity();
  setFieldError(field, valid ? '' : messageFor(field));
  return valid;
}

function buildPayload(form: HTMLFormElement, attribution: LeadAttribution): LeadPayload {
  const data = new FormData(form);
  const text = (key: string): string => String(data.get(key) ?? '').trim();

  return {
    nome: text('nome'),
    telefone: text('telefone').replace(/\D/g, ''),
    email: text('email').toLowerCase(),
    cargo: text('cargo'),
    empresa: text('empresa'),
    tamanhoTimeComercial: Number.parseInt(text('tamanhoTimeComercial'), 10),
    consentimentoLgpd: data.get('consentimentoLgpd') === 'on',
    origem: attribution,
  };
}

async function sendLead(payload: LeadPayload): Promise<void> {
  const response = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar lead: HTTP ${response.status}`);
  }
}

function trackConversion(payload: LeadPayload): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: 'generate_lead',
    utm_source: payload.origem.utm_source,
    utm_campaign: payload.origem.utm_campaign,
  });

  // Evento padrão "Lead" do Pixel da Meta: é ele que a campanha usa para otimizar.
  // Fica aqui para disparar só depois que o envio deu certo.
  window.fbq?.('track', 'Lead');
}

// Dá tempo do navegador despachar os eventos de conversão antes de sair da página.
const REDIRECT_DELAY_MS = 300;

// Guardado só na sessão do navegador para personalizar a página de obrigado —
// nunca na URL, que acabaria registrada em analytics e logs de servidor.
function rememberFirstName(fullName: string): void {
  try {
    sessionStorage.setItem(FIRST_NAME_KEY, fullName.split(' ')[0] ?? '');
  } catch {
    // Sem storage a página de obrigado usa a saudação genérica.
  }
}

function initLeadForm(form: HTMLFormElement): void {
  const attribution = resolveAttribution();
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const submitLoading = form.querySelector<HTMLElement>('[data-submit-loading]');
  const statusEl = form.querySelector<HTMLElement>('[data-form-status]');
  const phoneInput = form.querySelector<HTMLInputElement>('input[name="telefone"]');
  const fields = Array.from(form.querySelectorAll<HTMLInputElement>('input[required]'));

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  const teamSizeInput = form.querySelector<HTMLInputElement>('input[name="tamanhoTimeComercial"]');
  // Campo numérico nativo aceita "e", "+", "-" e casas decimais; aqui só faz sentido número inteiro positivo.
  teamSizeInput?.addEventListener('keydown', (event) => {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) event.preventDefault();
  });
  // Evita mudar o valor sem querer ao rolar a página com o cursor sobre o campo em foco.
  teamSizeInput?.addEventListener('wheel', () => teamSizeInput.blur(), { passive: true });

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  const setSubmitting = (submitting: boolean): void => {
    if (submitButton) submitButton.disabled = submitting;
    submitLabel?.toggleAttribute('hidden', submitting);
    submitLoading?.toggleAttribute('hidden', !submitting);
    form.setAttribute('aria-busy', String(submitting));
  };

  const showStatus = (message: string): void => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.hidden = !message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showStatus('');

    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot?.value) return;

    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length > 0) {
      invalidFields[0].focus();
      return;
    }

    const payload = buildPayload(form, attribution);
    setSubmitting(true);

    try {
      await sendLead(payload);
      trackConversion(payload);
      rememberFirstName(payload.nome);
      window.setTimeout(() => window.location.assign(THANK_YOU_PATH), REDIRECT_DELAY_MS);
    } catch {
      setSubmitting(false);
      showStatus('Não conseguimos enviar seus dados agora. Confira sua conexão e tente novamente em instantes.');
    }
  });
}

function initCtaLinks(): void {
  const canAutoFocus = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll<HTMLAnchorElement>('a[data-cta]').forEach((link) => {
    link.addEventListener('click', () => {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ event: 'cta_click', cta_location: link.dataset.cta });

      // No desktop o cursor já cai no primeiro campo; no mobile isso abriria o teclado no meio da rolagem.
      if (canAutoFocus && link.hash === '#formulario') {
        const firstField = document.querySelector<HTMLInputElement>('#formulario input[name="nome"]');
        window.setTimeout(() => firstField?.focus({ preventScroll: true }), 500);
      }
    });
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach(initLeadForm);
initCtaLinks();