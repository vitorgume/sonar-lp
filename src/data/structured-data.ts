import { faqs, features } from './content';
import { site } from './site';

export function buildHomeStructuredData(siteUrl: URL): Record<string, unknown>[] {
  const url = siteUrl.href;
  const organizationId = `${url}#organizacao`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: site.name,
      url,
      logo: new URL('/logo.png', siteUrl).href,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: `+${site.whatsappNumber}`,
        areaServed: 'BR',
        availableLanguage: 'Portuguese',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url,
      inLanguage: 'pt-BR',
      publisher: { '@id': organizationId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: site.name,
      alternateName: `${site.name} — ${site.tagline}`,
      url,
      description: site.description,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Análise de ligações de vendas',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      featureList: features.items.map((feature) => feature.title),
      publisher: { '@id': organizationId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];
}
