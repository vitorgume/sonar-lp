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
  title: 'Sonar | Raio-X das Ligações: análise de ligações de vendas com IA',
  description:
    'O Sonar ouve 100% das ligações do seu time comercial, aplica o seu playbook e mostra o minuto exato em que a venda escapou.',
  ogImageAlt: 'Sonar — análise de ligações de vendas com inteligência artificial',
  legalName: 'Sonar',
  privacyEmail: 'vitorvieira@gumeinteligencia.com.br',
};

export const navLinks: { label: string; href: string }[] = [
  { label: 'Sua dor', href: '#dor' },
  { label: 'Teste', href: '#teste' },
  { label: 'O Raio-X', href: '#raio-x' },
];
