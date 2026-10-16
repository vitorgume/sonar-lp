import { SMALL_TEAM, type LeadInterest } from '../data/raio-x';
import { track } from './analytics';
import { leadContext } from './lead-context';
import { formatPhone, initLeadForm, type LeadPayload } from './lead-form';

/**
 * Modal com as duas "portas" da LP:
 *  A (raio-x): pedido do Raio-X das Ligações → confirmação (times de 1 a 3 recebem a sugestão do vídeo).
 *  B (video):  dados → demonstração gravada liberada.
 * Qualquer elemento com [data-open="demo|video"] e [data-src="<origem>"] abre o modal.
 */
type Step = 'a1' | 'asmall' | 'a3' | 'b1' | 'b2';

const STEP_PROGRESS: Record<Step, number> = { a1: 1, asmall: 1, a3: 2, b1: 1, b2: 2 };

const modal = document.getElementById('modal');
const video = document.getElementById('demoVid') as HTMLVideoElement | null;
const nudge = document.getElementById('nudge');

if (modal) {
  const steps = Array.from(modal.querySelectorAll<HTMLElement>('[data-step]'));
  const progress = Array.from(modal.querySelectorAll<HTMLElement>('#mProg i'));
  const formA = document.getElementById('formA') as HTMLFormElement | null;
  const formB = document.getElementById('formB') as HTMLFormElement | null;

  let lastFocus: HTMLElement | null = null;
  let ctaOrigin = '';
  // Evita lead duplicado: quem já pediu o Raio-X ou liberou o vídeo nesta visita vai direto ao resultado.
  let raioXRequested = false;
  let videoUnlocked = false;
  let lastLead: LeadPayload | null = null;
  let nudged = false;

  const go = (name: Step): void => {
    steps.forEach((step) => (step.hidden = step.dataset.step !== name));
    progress.forEach((bar, index) => bar.classList.toggle('on', index < STEP_PROGRESS[name]));
    const current = modal.querySelector<HTMLElement>(`[data-step="${name}"]`);
    const first = current?.querySelector<HTMLElement>(
      'input:not([type=hidden]):not([type=radio]):not([tabindex="-1"]), h3[tabindex="-1"], button',
    );
    window.setTimeout(() => first?.focus(), 30);
  };

  const hideNudge = (): void => {
    nudged = true;
    nudge?.classList.remove('show');
  };

  const prefill = (form: HTMLFormElement | null, lead: LeadPayload): void => {
    if (!form) return;
    const set = (name: string, value: string): void => {
      const field = form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]:not([type=radio])`);
      if (field && !field.value) field.value = value;
    };
    set('nome', lead.nome);
    set('whatsapp', formatPhone(lead.telefone));
    set('empresa', lead.empresa);
    set('cargo', lead.cargo);
    const size = form.querySelector<HTMLInputElement>(`input[name="tamanho"][value="${lead.tamanhoTimeComercial}"]`);
    if (size && !form.querySelector('input[name="tamanho"]:checked')) size.checked = true;
  };

  const open = (interest: LeadInterest, source: string): void => {
    lastFocus = document.activeElement as HTMLElement | null;
    ctaOrigin = source;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    hideNudge();
    track('cta_click', { cta_location: source, porta: interest === 'video' ? 'B' : 'A', dor: leadContext.pain });

    if (interest === 'video') go(videoUnlocked ? 'b2' : 'b1');
    else go(raioXRequested ? 'a3' : 'a1');
  };

  const close = (): void => {
    modal.hidden = true;
    document.body.style.overflow = '';
    video?.pause();
    lastFocus?.focus();
  };

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-open]');
    if (!trigger) return;
    event.preventDefault();
    open(trigger.dataset.open === 'video' ? 'video' : 'raio-x', trigger.dataset.src ?? '');
  });

  document.getElementById('mClose')?.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  // Teclado: Esc fecha e o Tab fica preso dentro do modal enquanto ele está aberto.
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>('button, a[href], input:not([type=hidden]), select, video[controls], [tabindex="0"]'),
    ).filter((el) => el.tabIndex >= 0 && el.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (formA) {
    initLeadForm(formA, {
      interest: 'raio-x',
      ctaOrigin: () => ctaOrigin,
      onSuccess: ({ payload }) => {
        raioXRequested = true;
        lastLead = payload;
        go(payload.tamanhoTimeComercial === SMALL_TEAM ? 'asmall' : 'a3');
      },
    });
  }

  if (formB) {
    initLeadForm(formB, {
      interest: 'video',
      ctaOrigin: () => ctaOrigin,
      onSuccess: ({ payload }) => {
        videoUnlocked = true;
        lastLead = payload;
        go('b2');
      },
    });
  }

  document.getElementById('toVideo')?.addEventListener('click', () => {
    videoUnlocked = true;
    go('b2');
  });
  document.getElementById('toCal')?.addEventListener('click', () => {
    track('pediu_especialista', { tamanho: lastLead?.tamanhoTimeComercial });
    go('a3');
  });
  document.getElementById('bToA')?.addEventListener('click', () => {
    video?.pause();
    track('cta_click', { cta_location: 'pos-video', porta: 'A', dor: leadContext.pain });
    ctaOrigin = 'pos-video';
    if (raioXRequested) {
      go('a3');
      return;
    }
    // Quem acabou de ver o vídeo já informou os dados: o pedido do Raio-X vem preenchido.
    if (lastLead) prefill(formA, lastLead);
    go('a1');
  });

  video?.addEventListener('play', () => track('video_demo_play'), { once: true });

  // No celular, rola a folha para o campo focado não ficar sob o teclado.
  modal.querySelectorAll('input, select').forEach((field) =>
    field.addEventListener('focus', () => {
      if (window.innerWidth <= 940) window.setTimeout(() => field.scrollIntoView({ block: 'center' }), 250);
    }),
  );

  // Convite de saída: no desktop, uma única vez, quando o mouse sai pelo topo da janela.
  document.addEventListener('mouseout', (event) => {
    if (nudged || event.relatedTarget || event.clientY > 8 || !modal.hidden || window.innerWidth < 940) return;
    nudged = true;
    nudge?.classList.add('show');
    track('convite_saida_exibido');
  });
  document.getElementById('nudgeX')?.addEventListener('click', hideNudge);
}
