export interface SiteConfig {
  name: string;
  tagline: string;
  title: string;
  description: string;
  ogImageAlt: string;
  /** Razão social exibida no rodapé e na política de privacidade. */
  legalName: string;
  /** E-mail para solicitações de titulares de dados (LGPD). */
  privacyEmail: string;
}

export const site: SiteConfig = {
  name: 'Sonar',
  tagline: 'Sales Call Intelligence',
  title: 'Sonar | Análise de ligações de vendas com IA para times comerciais',
  description:
    'Avalie 100% das ligações do seu time comercial com IA: nota de 0 a 100, objeções, concorrentes e feedback pronto para o 1:1. Integra com Pipedrive, PipeRun e Moskit.',
  ogImageAlt: 'Sonar — análise de ligações de vendas com inteligência artificial',
  legalName: 'Sonar',
  privacyEmail: 'vitorvieira@gumeinteligencia.com.br',
};

export const navLinks: { label: string; href: string }[] = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Integrações', href: '#integracoes' },
  { label: 'Dúvidas', href: '#duvidas' },
];
