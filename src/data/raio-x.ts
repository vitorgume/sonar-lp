/**
 * Conteúdo das partes interativas da LP (dores, relatório, cena, teste e formulário).
 * É lido pelos componentes no build, pelos scripts no navegador e pela rota /api/lead,
 * que usa as mesmas listas para validar o que chega do formulário.
 */

export type PainKey = 'meta' | 'ouvir' | 'desconto' | 'playbook' | 'rampa' | 'feedback';

export interface Pain {
  /** Texto curto: aba da seção "A dor por dentro" e "Foco do seu Raio-X" no formulário. */
  label: string;
  /** Texto do botão no topo da página. */
  button: string;
  title: string;
  /** Pergunta que aparece no topo quando a dor é escolhida. */
  question: string;
  symptom: string;
  cost: string;
  ask: string;
  /** Índice do apontamento do relatório que fica em destaque para esta dor. */
  finding: number;
  coach: string;
  /** Caminhos do ícone (viewBox 0 0 24 24, traço). */
  icon: string;
}

export const DEFAULT_PAIN: PainKey = 'meta';

export const pains: Record<PainKey, Pain> = {
  meta: {
    label: 'A meta não fecha',
    button: 'A meta não fecha e ninguém sabe por quê',
    title: 'A meta não fecha e ninguém sabe por quê.',
    question: 'Em que minuto as suas vendas estão escapando?',
    symptom: '"O mês foi fraco, mas o funil estava cheio."',
    cost: 'A correção acontece no escuro: mais lead, mais pressão e o mesmo resultado.',
    ask: 'Em que minuto as suas vendas estão escapando?',
    finding: 3,
    coach: 'O cliente estava com <b>intenção de compra alta</b>. A venda esfriou no último minuto.',
    icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  },
  ouvir: {
    label: 'Não dá para ouvir todos',
    button: 'Não dá para ouvir todo mundo',
    title: 'Não dá para ouvir todo mundo.',
    question: 'O que o seu time está dizendo nas ligações que ninguém ouve?',
    symptom: '"Ouço duas ou três ligações por semana, quando dá."',
    cost: 'A gestão decide com base em menos de 1% das conversas do time.',
    ask: 'O que o seu time está dizendo nas outras 99%?',
    finding: 2,
    coach: 'Esta ligação teria passado em branco. <b>4 pontos de atenção</b> em 42 minutos.',
    icon: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
  },
  desconto: {
    label: 'Desconto antes da objeção',
    button: 'O desconto sai antes da objeção',
    title: 'O desconto sai antes da objeção.',
    question: 'Quantos descontos o seu time deu sem o cliente pedir?',
    symptom: '"Fechamos, mas com margem menor do que devia."',
    cost: 'Margem perdida em vendas que fechariam sem desconto.',
    ask: 'Quantos descontos o seu time deu sem o cliente pedir?',
    finding: 0,
    coach: 'O cliente falou de valor. O vendedor ofereceu desconto <b>antes de perguntar</b> o que ele estava comparando.',
    icon: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  },
  playbook: {
    label: 'Playbook no drive',
    button: 'O playbook ficou no drive',
    title: 'O playbook ficou no drive.',
    question: 'Em quantas ligações o seu playbook foi seguido de verdade?',
    symptom: '"Fizemos o roteiro, treinamos, e cada um faz do seu jeito."',
    cost: 'O investimento no playbook não vira comportamento no dia a dia.',
    ask: 'Em quantas ligações o roteiro foi seguido de verdade?',
    finding: 1,
    coach: 'O Sonar confere <b>cada regra do seu playbook</b>, em cada ligação, e mostra o trecho.',
    icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  },
  rampa: {
    label: 'Novato demora a render',
    button: 'O vendedor novo demora a render',
    title: 'O vendedor novo demora a render.',
    question: 'O que o seu melhor vendedor faz que o novato não faz?',
    symptom: '"Leva meses para o novato ficar bom."',
    cost: 'Salário pago na rampa e leads queimados no aprendizado.',
    ask: 'O que o seu melhor vendedor faz que o novato não faz?',
    finding: 2,
    coach: 'Seus melhores vendedores confirmam o decisor na descoberta. Este, <b>não</b>.',
    icon: '<path d="M3 20h18"/><path d="M5 16l4-4 3 3 7-7"/><path d="M15 8h4v4"/>',
  },
  feedback: {
    label: '1:1 no achismo',
    button: 'O 1:1 vira achismo',
    title: 'O 1:1 vira achismo.',
    question: 'Qual é o próximo ponto que cada vendedor precisa treinar?',
    symptom: '"O feedback vira opinião, e o vendedor não compra."',
    cost: 'Conversas de desenvolvimento que não mudam nada na próxima ligação.',
    ask: 'Qual é o próximo ponto que cada vendedor precisa treinar?',
    finding: 3,
    coach: 'Próximo ponto a treinar deste closer: <b>agendar o próximo passo antes de desligar</b>.',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  },
};

export const painKeys = Object.keys(pains) as PainKey[];

export function isPainKey(value: unknown): value is PainKey {
  return typeof value === 'string' && value in pains;
}

/* ---------- relatório de exemplo ---------- */

export interface Finding {
  time: string;
  tone: '' | 'warn';
  text: string;
  rule: string;
}

export const findings: Finding[] = [
  { time: '14:32', tone: '', text: 'Desconto de <b>15%</b> oferecido sem o cliente pedir.', rule: 'Regra: desconto só mediante negociação explícita.' },
  { time: '21:05', tone: 'warn', text: 'Prometeu implantação em <b>5 dias úteis</b>.', rule: 'Playbook: o prazo real é de 15 dias úteis.' },
  { time: '33:10', tone: '', text: 'Objeção de <b>decisor</b> não tratada.', rule: 'Playbook: confirmar quem decide ainda na descoberta.' },
  { time: '38:50', tone: '', text: 'Ligação encerrada <b>sem próximo passo</b>.', rule: 'Regra: toda ligação termina com ação e data marcada.' },
];

/** Posição (%) de cada apontamento na linha do tempo da ligação. */
export const findingPositions = [34.4, 50.2, 79, 92.6];
export const reportScore = 64;

export const transcriptLines = [
  '<b>Cliente:</b> E qual seria o investimento?',
  '<b>Vendedor:</b> Consigo fazer com 15% de desconto…',
  '<b>Vendedor:</b> Em 5 dias úteis a gente implanta.',
  '<b>Cliente:</b> Preciso ver com meu sócio…',
  '<b>Cliente:</b> Te dou um retorno, beleza?',
];

/* ---------- a venda que escapou ---------- */

export interface SceneChoice {
  key: 'A' | 'B' | 'C';
  line: string;
  chip: ['bad' | 'ok' | 'warn', string];
  heading: string;
  text: string;
}

export const sceneChoices: SceneChoice[] = [
  {
    key: 'A',
    line: 'Consigo fazer 15% de desconto se fechar hoje.',
    chip: ['bad', 'Regra violada'],
    heading: 'Desconto antes de entender a objeção.',
    text: 'O cliente disse que o valor estava acima do esperado, mas não disse em relação a quê. O desconto saiu antes da pergunta. Margem perdida numa venda que talvez fechasse sem ele.',
  },
  {
    key: 'B',
    line: 'Entendo. Acima em relação a quê? Me conta com o que você comparou.',
    chip: ['ok', 'Dentro do playbook'],
    heading: 'Explorou a objeção antes de negociar.',
    text: 'Perguntar com o que o cliente comparou revela se o problema é preço, valor percebido ou concorrente. É esse tipo de fala que o Sonar destaca como referência para o resto do time.',
  },
  {
    key: 'C',
    line: 'Te mando a proposta por e-mail e você analisa com calma.',
    chip: ['warn', 'Fora do padrão'],
    heading: 'A conversa terminou sem próximo passo.',
    text: 'Mandar a proposta por e-mail sem data marcada deixa a decisão com o cliente. A venda esfria. O Sonar marca o minuto e mostra ao vendedor como fechar com uma próxima ação.',
  },
];

/* ---------- teste do ponto cego ---------- */

export const quizQuestions = [
  'Você sabe qual objeção mais derruba vendas no seu time?',
  'No último mês, você ouviu mais de 10% das ligações do time?',
  'Na última venda perdida, você sabe se o playbook foi seguido?',
  'Você sabe quais concorrentes os clientes citaram este mês?',
  'Cada vendedor sabe qual é o próximo ponto que precisa treinar?',
];

export type QuizLevel = 'grande' | 'parcial' | 'boa';

export interface QuizResult {
  level: QuizLevel;
  heading: string;
  text: string;
  /** Posição (%) do marcador na régua "ponto cego → visão total". */
  position: number;
}

export const quizResults: QuizResult[] = [
  {
    level: 'grande',
    heading: 'Ponto cego grande.',
    text: 'Hoje, a maior parte do que decide as suas vendas acontece sem a gestão ver. A boa notícia: é exatamente o que o Raio-X mostra em 30 minutos.',
    position: 12,
  },
  {
    level: 'parcial',
    heading: 'Visão parcial.',
    text: 'Você enxerga parte da operação, mas depende de amostra e de percepção. O Raio-X mostra o que está ficando de fora.',
    position: 50,
  },
  {
    level: 'boa',
    heading: 'Boa visibilidade.',
    text: 'Você já acompanha de perto. O Sonar leva essa visão para 100% das ligações, sem depender do seu tempo.',
    position: 88,
  },
];

export const quizLevels = quizResults.map((result) => result.level);

export function quizResultFor(yesAnswers: number): QuizResult {
  const index = yesAnswers <= 1 ? 0 : yesAnswers <= 3 ? 1 : 2;
  return quizResults[index]!;
}

/* ---------- formulário ---------- */

/** Raio-X: pedido de conversa com especialista. Vídeo: libera a demonstração gravada. */
export type LeadInterest = 'raio-x' | 'video';

export const roleOptions = [
  'Sócio ou CEO',
  'Diretor comercial',
  'Gerente ou coordenador comercial',
  'Líder de SDR ou pré-vendas',
  'Enablement ou treinamento',
  'Vendedor, closer ou SDR',
  'Outro',
];

export const teamSizes = [
  { value: '1-3', label: '1 a 3' },
  { value: '4-10', label: '4 a 10' },
  { value: '11-30', label: '11 a 30' },
  { value: '30+', label: '30+' },
] as const;

export type TeamSize = (typeof teamSizes)[number]['value'];

/** Times até este tamanho recebem a sugestão de começar pela demonstração gravada. */
export const SMALL_TEAM: TeamSize = '1-3';

export function isTeamSize(value: unknown): value is TeamSize {
  return teamSizes.some((size) => size.value === value);
}

/** Validação leve (algo@dominio.tld, sem espaços); a confirmação real do endereço fica com o n8n. */
export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
