import type { IconName } from '../components/ui/icon-names';

export interface IconItem {
  icon: IconName;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface Feature extends IconItem {
  highlight?: string;
  badge?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export const hero = {
  eyebrow: 'Inteligência de ligações de vendas com IA',
  title: 'Saiba o que acontece em',
  titleHighlight: 'cada ligação',
  titleEnd: 'do seu time comercial',
  lead:
    'O Sonar transcreve as calls, avalia cada uma com a régua do seu playbook e mostra onde o vendedor saiu do roteiro, quais objeções ficaram sem resposta e contra quem você está perdendo.',
  bullets: [
    'Nota de 0 a 100 em toda ligação, com o motivo de cada ponto',
    'Ligações importadas automaticamente da sua central VoIP',
    'Resumo da análise publicado direto no negócio do CRM',
  ],
};

export const leadForm = {
  title: 'Veja o Sonar analisando ligações como as do seu time',
  subtitle: 'Preencha e um especialista entra em contato para agendar uma demonstração guiada.',
  submitLabel: 'Agendar minha demonstração',
  submittingLabel: 'Enviando...',
  reassurance: 'Sem compromisso. Seus dados são usados apenas para o contato comercial.',
};

export type IntegrationLogo = 'pipedrive' | 'piperun' | 'moskit' | 'api4com' | 'syma-voiceip';

export interface Integration {
  name: string;
  logo: IntegrationLogo;
  /** Empresa dona do produto, quando o logo exibido é o dela e não o do produto. */
  vendor?: string;
}

export const integrations = {
  title: 'Conecta com o CRM e a central que seu time já usa',
  crm: [
    { name: 'Pipedrive', logo: 'pipedrive' },
    { name: 'PipeRun', logo: 'piperun' },
    { name: 'Moskit', logo: 'moskit' },
  ] satisfies Integration[],
  voip: [
    { name: 'API4COM', logo: 'api4com' },
    { name: 'VoiceIP', logo: 'syma-voiceip', vendor: 'Syma Solutions' },
    { name: 'PipeRun', logo: 'piperun' },
  ] satisfies Integration[],
};

export const problem = {
  eyebrow: 'O ponto cego da gestão comercial',
  title: 'A média mente. E a ligação que você não ouviu custa caro.',
  lead:
    'O CRM registra que o negócio foi perdido. Não registra o porquê. Enquanto isso, o gestor ouve duas ou três calls por semana e decide o resto por percepção.',
  items: [
    {
      icon: 'headphones',
      title: 'Você só escuta uma amostra',
      description:
        'Ouvir ligação leva tempo. O coaching do time acaba saindo de uma fração das conversas, geralmente as que alguém lembrou de mandar.',
    },
    {
      icon: 'circle-question-mark',
      title: 'Perdeu. Mas por quê?',
      description:
        'Preço, momento, decisor, concorrente? Sem a conversa analisada, o motivo real da perda vira um campo preenchido às pressas.',
    },
    {
      icon: 'book-x',
      title: 'O playbook fica no drive',
      description:
        'As regras existem, mas ninguém sabe se estão sendo seguidas na call — até o desconto sem pedido virar margem perdida.',
    },
    {
      icon: 'messages-square',
      title: 'Feedback vira opinião',
      description:
        'Sem evidência, o 1:1 é percepção do gestor contra percepção do vendedor. E ninguém sai da conversa sabendo o que treinar.',
    },
  ] satisfies IconItem[],
};

export const howItWorks = {
  eyebrow: 'Como funciona',
  title: 'Da ligação ao relatório, sem ninguém apertar o play',
  lead: 'Você configura uma vez. Depois disso, cada call que o time faz vira análise.',
  steps: [
    {
      title: 'A ligação chega sozinha',
      description:
        'O Sonar importa as gravações da sua central VoIP automaticamente. Também dá para enviar arquivos MP3, WAV ou M4A, um a um ou em massa.',
    },
    {
      title: 'A IA transcreve e separa quem é quem',
      description:
        'A transcrição identifica o que é fala do vendedor e o que é fala do cliente, para medir escuta, ritmo e vícios de linguagem de quem vende.',
    },
    {
      title: 'Avaliação com a régua da sua empresa',
      description:
        'Cada ligação é avaliada pelos critérios que você define — um para SDR, outro para closer — consultando seu playbook, sua tabela de preços e seus battlecards.',
    },
    {
      title: 'Relatório pronto e CRM atualizado',
      description:
        'Nota final, objeções, concorrentes e intenção de compra no relatório. O resumo da análise é publicado como nota no negócio em aberto do CRM.',
    },
  ] satisfies Step[],
};

export const showcase = {
  eyebrow: 'O que você recebe em cada ligação',
  title: 'Não é um resumo de call. É o seu playbook aplicado em toda conversa.',
  lead:
    'A análise aponta a regra específica que foi quebrada e cita o documento de onde ela veio. É o tipo de feedback que um gestor experiente daria — só que em todas as ligações.',
  callouts: [
    {
      icon: 'gauge',
      title: 'Nota de 0 a 100',
      description: 'Uma régua única para comparar ligações, vendedores e períodos sem achismo.',
    },
    {
      icon: 'shield-alert',
      title: 'Objeções mapeadas',
      description: 'Preço, momento, decisor, necessidade, confiança ou concorrente — e se foi contornada.',
    },
    {
      icon: 'ear',
      title: 'Fala x escuta',
      description: 'Quanto o vendedor falou, em que velocidade e com quais vícios de linguagem.',
    },
    {
      icon: 'file-search',
      title: 'Base de conhecimento citada',
      description: 'Os trechos do playbook usados na avaliação ficam visíveis no relatório.',
    },
  ] satisfies IconItem[],
};

export const features = {
  eyebrow: 'Recursos',
  title: 'Tudo o que o gestor precisa para treinar o time com dado',
  lead: 'Da análise de uma única call à estratégia do próximo trimestre.',
  items: [
    {
      icon: 'file-headphone',
      title: 'Relatório de cada ligação',
      description:
        'Nota final, KPIs, análise da IA, campos customizados e a transcrição sincronizada com o áudio para ir direto ao trecho que importa.',
    },
    {
      icon: 'sliders-horizontal',
      title: 'Régua de avaliação própria',
      description:
        'Critérios diferentes por função e por tipo de ligação. Não sabe por onde começar? Descreva o que sua empresa vende e a IA escreve o primeiro rascunho.',
    },
    {
      icon: 'library',
      title: 'Base de conhecimento',
      description:
        'Suba playbook, tabela de preços, FAQ e battlecards em PDF, DOCX ou TXT. A IA consulta os trechos mais relevantes em cada análise.',
    },
    {
      icon: 'list-checks',
      title: 'Campos customizados',
      description:
        'Crie as métricas que só a sua operação acompanha — sim/não, número, percentual ou texto — e envie os valores para campos do seu CRM.',
    },
    {
      icon: 'users',
      title: 'Sales Enablement',
      description:
        'O desempenho de cada vendedor no período, com pontos de melhoria baseados em evidência e recomendações de estudo. Pronto para o 1:1.',
      highlight: 'Chegue ao 1:1 com dados do período, não com percepção.',
    },
    {
      icon: 'radar',
      title: 'Dashboard estratégico',
      description:
        'Objeções, fala x escuta, concorrentes e sentimento do cliente em um só lugar, mais um mapa do que aparece junto nas conversas e do que mudou no período.',
      highlight: 'A estratégia do próximo trimestre decidida com dado.',
    },
  ] satisfies Feature[],
};

export const strategy = {
  eyebrow: 'Inteligência de mercado',
  title: 'Toda ligação guarda algo que nenhum CRM registra',
  lead: 'O que o mercado devolve sobre a sua oferta. O Sonar junta essas respostas e transforma em direção para o time.',
  questions: [
    {
      icon: 'funnel',
      title: 'Onde o funil trava?',
      description: 'As objeções que mais aparecem, por categoria, e a taxa de tratamento de cada uma.',
    },
    {
      icon: 'audio-lines',
      title: 'O time escuta o suficiente?',
      description: 'O tempo de fala do vendedor e quantas ligações ficam dentro da faixa ideal.',
    },
    {
      icon: 'swords',
      title: 'Contra quem você está perdendo?',
      description: 'Os concorrentes citados, quem trouxe o nome para a conversa e como o cliente os enxerga.',
    },
    {
      icon: 'heart-handshake',
      title: 'Como o cliente sai da conversa?',
      description: 'O sentimento do cliente e os sinais de intenção de compra ao longo do período.',
    },
  ] satisfies IconItem[],
};

export const audiences = {
  eyebrow: 'Para quem é',
  title: 'Feito para times que vendem por telefone e videochamada',
  items: [
    {
      icon: 'briefcase',
      title: 'Gestores e heads comerciais',
      description:
        'Visibilidade de 100% das ligações, comparação entre vendedores e períodos e leitura de mercado para decidir onde agir.',
    },
    {
      icon: 'target',
      title: 'Líderes de SDR e pré-vendas',
      description:
        'Régua própria para qualificação e diagnóstico, com os pontos de cada call que precisam de ajuste antes de virar hábito.',
    },
    {
      icon: 'graduation-cap',
      title: 'Enablement e treinamento',
      description:
        'Pontos de melhoria com evidência e recomendações de estudo por vendedor para montar trilhas que atacam o problema real.',
    },
    {
      icon: 'user-round-check',
      title: 'O próprio vendedor',
      description:
        'Um perfil com a trajetória, as conquistas e os pontos fortes escritos a partir das ligações analisadas — não de autoavaliação.',
    },
  ] satisfies IconItem[],
};

export const midCta = {
  title: 'Quer ver uma ligação do seu segmento avaliada pelo Sonar?',
  description: 'Mostramos na prática como a IA aplica um playbook, nomeia a regra quebrada e entrega o feedback pronto.',
  button: 'Agendar demonstração',
};

export const faqs: Faq[] = [
  {
    question: 'O que é o Sonar?',
    answer:
      'O Sonar é uma plataforma de inteligência de ligações de vendas. Ele recebe as gravações das calls do seu time, transcreve, separa vendedor e cliente e usa IA para avaliar cada conversa com os critérios e documentos da sua empresa, gerando nota de 0 a 100, objeções, concorrentes, intenção de compra e feedback para o vendedor.',
  },
  {
    question: 'Preciso trocar meu CRM ou minha central telefônica?',
    answer:
      'Não. O Sonar se integra a CRMs como Pipedrive, PipeRun e Moskit e a centrais como API4COM, VoiceIP e PipeRun. Se a sua central ainda não tiver integração, você pode enviar os áudios em MP3, WAV ou M4A, inclusive em massa.',
  },
  {
    question: 'Como a IA sabe o que é uma boa ligação para a minha empresa?',
    answer:
      'Você define a régua de avaliação: critérios por função (SDR, closer) e por tipo de ligação. Além disso, sobe seu playbook, tabela de preços e battlecards na base de conhecimento. Em cada análise, a IA consulta os trechos mais relevantes desses documentos e aponta qual regra foi seguida ou quebrada.',
  },
  {
    question: 'Funciona para ligações por videochamada?',
    answer:
      'Sim. Além das ligações importadas da central VoIP, você pode enviar o áudio de reuniões gravadas em videochamada nos formatos MP3, WAV ou M4A.',
  },
  {
    question: 'O que acontece com o CRM depois da análise?',
    answer:
      'O Sonar vincula a ligação ao contato, publica um resumo da análise como nota no negócio em aberto e pode preencher campos do CRM com as métricas que você criou nos campos customizados.',
  },
  {
    question: 'O vendedor também tem acesso?',
    answer:
      'Sim. Gestores e vendedores têm perfis de acesso diferentes. O vendedor acompanha as próprias ligações e um perfil com sua trajetória, conquistas e pontos fortes; o gestor vê o time inteiro, o Sales Enablement e o dashboard estratégico.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Os planos variam pelo volume de ligações analisadas por mês e pelos módulos contratados, como integração com VoIP e CRM, Sales Enablement e dashboard estratégico. Na conversa com nosso time comercial indicamos o plano certo para o tamanho da sua operação.',
  },
];

export const finalCta = {
  eyebrow: 'Próximo passo',
  title: 'Pare de gerenciar o time pela amostra',
  lead:
    'Deixe seus dados e um especialista do Sonar mostra, em uma demonstração guiada, como seria ter todas as ligações do seu time avaliadas com a sua régua.',
  bullets: [
    'Demonstração com um especialista, sem compromisso',
    'Entendemos seu processo comercial antes de mostrar a plataforma',
    'Indicamos o plano certo para o tamanho do seu time',
  ],
};
