/**
 * Classes exatas do Design System "Modern Teal" (CLAUDE.md do Sonar).
 * Variações de tamanho substituem só o padding/fonte, nunca a identidade do componente.
 */
const primaryBase =
  'flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const secondaryBase =
  'flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2';

export const ui = {
  card: 'bg-white rounded-xl border border-slate-200 shadow-sm p-6',
  buttonPrimary: `${primaryBase} px-4 py-2`,
  buttonPrimaryLg: `${primaryBase} px-6 py-3 text-base`,
  buttonSecondary: `${secondaryBase} px-4 py-2`,
  buttonSecondaryLg: `${secondaryBase} px-6 py-3 text-base`,
  // `text-base` no mobile evita o zoom automático do iOS ao focar campos com fonte < 16px.
  input:
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-700 text-base sm:text-sm bg-white aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-500',
  label: 'block text-sm font-medium text-slate-700',
  eyebrow: 'text-sm font-semibold uppercase tracking-wider text-teal-700',
  sectionTitle: 'text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl text-balance',
  sectionLead: 'mt-4 text-lg text-slate-500 text-pretty',
  aiBadge: 'inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800',
} as const;
