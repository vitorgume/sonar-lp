import { DEFAULT_PAIN, type PainKey, type QuizLevel } from '../data/raio-x';

/**
 * O que o visitante escolheu na página e que acompanha o lead até o n8n:
 * a dor marcada no topo (ou nas abas) e o resultado do teste do ponto cego.
 */
export const PAIN_CHANGE_EVENT = 'sonar:pain';

let pain: PainKey = DEFAULT_PAIN;
let quizLevel: QuizLevel | '' = '';

export const leadContext = {
  get pain(): PainKey {
    return pain;
  },
  setPain(next: PainKey): void {
    pain = next;
    document.dispatchEvent(new CustomEvent<PainKey>(PAIN_CHANGE_EVENT, { detail: next }));
  },
  get quizLevel(): QuizLevel | '' {
    return quizLevel;
  },
  setQuizLevel(next: QuizLevel): void {
    quizLevel = next;
  },
};
