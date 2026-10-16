import { isPainKey, pains, type PainKey } from '../data/raio-x';
import { prefersReducedMotion, track } from './analytics';
import { leadContext } from './lead-context';

// A dor escolhida no topo (ou nas abas de "A dor por dentro") muda a pergunta do topo, a seção da dor,
// o destaque do relatório e o "Foco do seu Raio-X" no formulário.
const setText = (id: string, text: string): void => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

function applyPain(key: PainKey): void {
  const pain = pains[key];

  document.querySelectorAll<HTMLButtonElement>('[data-pain]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.pain === key));
  });

  const question = document.getElementById('heroQ');
  if (question) {
    question.style.opacity = '0';
    window.setTimeout(
      () => {
        question.textContent = pain.question;
        question.style.opacity = '1';
      },
      prefersReducedMotion() ? 0 : 180,
    );
  }

  setText('dorTitle', pain.title);
  setText('aSint', pain.symptom);
  setText('aCusto', pain.cost);
  setText('aPerg', pain.ask);
  setText('mDor', pain.label.toLowerCase());
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-pain]');
  const key = button?.dataset.pain;
  if (!button || !isPainKey(key)) return;

  applyPain(key);
  leadContext.setPain(key);
  track('dor_escolhida', { dor: key });

  // Nas abas com rolagem lateral (celular), mantém a aba escolhida visível.
  if (button.closest('#painTabs')) {
    button.scrollIntoView({ inline: 'center', block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
});
