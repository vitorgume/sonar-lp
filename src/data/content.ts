import type { ImageMetadata } from 'astro';
import accion from '../assets/clients/accion.png';
import evo from '../assets/clients/evo.png';
import grupoInglaterra from '../assets/clients/grupo-inglaterra.png';
import grupoIrrah from '../assets/clients/grupo-irrah.png';
import grupoMedtrab from '../assets/clients/grupo-medtrab.png';
import ingaDigital from '../assets/clients/inga-digital.png';
import mener from '../assets/clients/mener.png';
import minus from '../assets/clients/minus.png';
import motorlub from '../assets/clients/motorlub.png';
import neoprint from '../assets/clients/neoprint.png';
import peon from '../assets/clients/peon.png';
import perfileveAluminio from '../assets/clients/perfileve-aluminio.png';
import porvir from '../assets/clients/porvir.png';
import protiumDynamics from '../assets/clients/protium-dynamics.png';
import recco from '../assets/clients/recco.png';
import stmgo from '../assets/clients/stmgo.png';
import sub100 from '../assets/clients/sub100.png';
import yellowPanda from '../assets/clients/yellow-panda.png';

export const hero = {
  eyebrow: 'Sales Call Intelligence · um produto Gume',
  title: 'Toda venda é decidida numa ligação.',
  painsLabel: 'Qual destas mais pesa no seu time hoje?',
  painsHint: 'Escolha uma.',
  primaryCta: 'Quero meu Raio-X das Ligações',
  secondaryCta: 'Ver o Sonar em ação',
  micro: ['30 minutos', 'Com exemplos do seu segmento', 'Sem compromisso'],
};

export const proof = {
  facts: [
    { strong: '75+', text: 'empresas atendidas' },
    { strong: 'Empresa Revelação', text: 'do Ano 2024' },
  ],
  integrations: ['Pipedrive', 'PipeRun', 'Moskit', 'API4COM', 'VoiceIP'],
  clientsTitle: 'Empresas que já confiaram na Gume',
};

export interface ClientLogo {
  name: string;
  image: ImageMetadata;
}

export const clients: ClientLogo[] = [
  { name: 'Evo', image: evo },
  { name: 'Ingá Digital', image: ingaDigital },
  { name: 'Grupo Inglaterra', image: grupoInglaterra },
  { name: 'Grupo Irrah', image: grupoIrrah },
  { name: 'Grupo Medtrab', image: grupoMedtrab },
  { name: 'Méner', image: mener },
  { name: 'Minus', image: minus },
  { name: 'Motorlub', image: motorlub },
  { name: 'Neoprint', image: neoprint },
  { name: 'Peōn', image: peon },
  { name: 'Perfileve Alumínio', image: perfileveAluminio },
  { name: 'Porvir', image: porvir },
  { name: 'Protium Dynamics', image: protiumDynamics },
  { name: 'Recco', image: recco },
  { name: 'stmgo', image: stmgo },
  { name: 'Sub100', image: sub100 },
  { name: 'Yellow Panda', image: yellowPanda },
  { name: 'Accion', image: accion },
];

export interface OfferItem {
  title: string;
  text: string;
  /** Caminhos do ícone (viewBox 0 0 24 24, traço). */
  icon: string;
}

export const offer = {
  title: 'Em 30 minutos, você vê o que acontece nas ligações do seu time.',
  text: 'O Raio-X das Ligações é uma conversa com um especialista do Sonar, feita para o seu cenário. Você sai com respostas, mesmo que decida não contratar.',
  meta: ['30 min', 'videochamada', 'sem compromisso'],
  items: [
    {
      title: 'Uma ligação do seu segmento, avaliada ao vivo',
      text: 'Nota, objeções e o minuto em que a venda escapou.',
      icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    },
    {
      title: 'O rascunho da régua do seu time',
      text: 'Os critérios de uma boa ligação na sua empresa, gerados com a IA do Sonar a partir do que você contar.',
      icon: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    },
    {
      title: 'O tamanho do seu ponto cego',
      text: 'Quantas ligações por mês ninguém ouve e o que isso esconde.',
      icon: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    },
    {
      title: 'O plano certo para o tamanho do seu time',
      text: 'Sem proposta empurrada.',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
    },
  ] satisfies OfferItem[],
  risk: 'Se o Sonar não fizer sentido para o seu time, a gente diz na hora.',
};

export const why = {
  title: 'Sem instalação. Sem trocar de CRM ou de telefonia.',
  items: [
    { title: 'Um treinador', text: 'Cada vendedor recebe feedback minutos depois de desligar.' },
    { title: 'Um analista', text: 'As objeções, os concorrentes e quem decide, em dados.' },
    { title: 'Um guardião', text: 'O playbook conferido em cada conversa. Não são três ferramentas. É uma só.' },
  ],
};

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: 'O Raio-X é uma reunião de vendas?',
    answer:
      'É uma demonstração feita para o seu cenário. Você vê o Sonar avaliando uma ligação do seu segmento e sai com o rascunho da régua do seu time. Se fizer sentido, indicamos o plano. Se não fizer, a gente diz.',
  },
  {
    question: 'Preciso trocar meu CRM ou minha telefonia?',
    answer:
      'Não. O Sonar integra com Pipedrive, PipeRun e Moskit, e com as centrais API4COM, VoiceIP e PipeRun. Sem integração, você envia os áudios em MP3, WAV ou M4A.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Os planos variam pelo volume mensal de ligações e pelos módulos contratados. No Raio-X, indicamos o plano certo para o tamanho do seu time.',
  },
  {
    question: 'Meu time vai se sentir vigiado?',
    answer:
      'O Sonar funciona como treinador. Cada vendedor vê as próprias ligações e o próprio perfil, com pontos fortes e o próximo ponto a trabalhar.',
  },
  {
    question: 'Funciona para videochamadas?',
    answer: 'Sim. Envie o áudio das reuniões gravadas em MP3, WAV ou M4A, e a análise segue a mesma régua.',
  },
];

/** Recursos citados no schema.org (SoftwareApplication.featureList). */
export const featureList = [
  'Análise de 100% das ligações de vendas com IA',
  'Nota por ligação e linha do tempo com pontos de atenção',
  'Conferência do playbook em cada conversa',
  'Mapeamento de objeções, concorrentes e decisores',
  'Feedback individual para cada vendedor',
  'Integração com Pipedrive, PipeRun, Moskit, API4COM e VoiceIP',
];
