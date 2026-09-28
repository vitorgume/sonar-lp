import { resolveAttribution, type LeadAttribution } from './attribution';
import { FIRST_NAME_KEY } from './storage-keys';

interface LeadPayload {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  tamanhoEquipe: string;
  crm: string;
  consentimentoLgpd: boolean;
  origem: LeadAttribution;
  enviadoEm: string;
}

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

const ENDPOINT = import.meta.env.PUBLIC_LEAD_ENDPOINT ?? '';
const THANK_YOU_PATH = '/obrigado';

const FIELD_MESSAGES: Record<string, Partial<Record<keyof ValidityState, string>>> = {
  nome: { valueMissing: 'Informe seu nome.', tooShort: 'Digite seu nome completo.' },
  email: {
    valueMissing: 'Informe seu e-mail.',
    typeMismatch: 'Digite um e-mail válido, como nome@empresa.com.br.',
  },
  telefone: {
    valueMissing: 'Informe seu WhatsApp.',
    patternMismatch: 'Digite o número com DDD, como (11) 91234-5678.',
  },
  empresa: { valueMissing: 'Informe o nome da empresa.' },
  cargo: { valueMissing: 'Selecione seu cargo.' },
  tamanhoEquipe: { valueMissing: 'Selecione o tamanho do time comercial.' },
  consentimentoLgpd: { valueMissing: 'Precisamos do seu aceite para entrar em contato.' },
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function messageFor(field: HTMLInputElement | HTMLSelectElement): string {
  const messages = FIELD_MESSAGES[field.name] ?? {};
  const failing = (Object.keys(messages) as (keyof ValidityState)[]).find((key) => field.validity[key]);
  return failing ? (messages[failing] ?? field.validationMessage) : field.validationMessage;
}

function setFieldError(field: HTMLInputElement | HTMLSelectElement, message: string): void {
  const errorEl = document.getElementById(`${field.id}-erro`);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }
}

function validateField(field: HTMLInputElement | HTMLSelectElement): boolean {
  const valid = field.checkValidity();
  setFieldError(field, valid ? '' : messageFor(field));
  return valid;
}

function buildPayload(form: HTMLFormElement, attribution: LeadAttribution): LeadPayload {
  const data = new FormData(form);
  const text = (key: string): string => String(data.get(key) ?? '').trim();

  return {
    nome: text('nome'),
    email: text('email').toLowerCase(),
    telefone: text('telefone').replace(/\D/g, ''),
    empresa: text('empresa'),
    cargo: text('cargo'),
    tamanhoEquipe: text('tamanhoEquipe'),
    crm: text('crm'),
    consentimentoLgpd: data.get('consentimentoLgpd') === 'on',
    origem: attribution,
    enviadoEm: new Date().toISOString(),
  };
}

async function sendLead(payload: LeadPayload): Promise<void> {
  if (!ENDPOINT) {
    if (import.meta.env.DEV) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return;
    }
    throw new Error('PUBLIC_LEAD_ENDPOINT não configurado.');
  }

  const response = await fetch(ENDPOINT, {
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
    lead_team_size: payload.tamanhoEquipe,
    lead_role: payload.cargo,
    lead_crm: payload.crm,
    utm_source: payload.origem.utm_source,
    utm_campaign: payload.origem.utm_campaign,
  });
}

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
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[required], select[required]'));

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

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
      window.location.assign(THANK_YOU_PATH);
    } catch {
      setSubmitting(false);
      showStatus(
        'Não conseguimos enviar seus dados agora. Tente novamente em instantes ou fale com a gente pelo WhatsApp.',
      );
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
