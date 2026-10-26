import type { ChartTone } from '@/shared/theme/chartColors'

export const ALLOCATION_TONES: Record<string, ChartTone> = {
  actions: 'series1',
  taux: 'series3',
  'cash / monétaire': 'series4',
  immobilier: 'series7',
  'private equity': 'series2',
  commodities: 'series8',
  crypto: 'series6',
  france: 'series1',
  europe: 'series6',
  'amérique du nord': 'series5',
  japon: 'series4',
  chine: 'accentText',
  asie: 'series2',
  océanie: 'series10',
  emergent: 'series8',
  eur: 'series6',
  usd: 'series5',
  tech: 'series1',
  finance: 'series4',
  santé: 'series3',
  'conso cyclique': 'series7',
  'conso défensive': 'series8',
  industrie: 'series6',
  energie: 'series5',
  service: 'series11',
  telecom: 'series9',
  'services publics': 'series12',
}

export const ACCOUNT_TONES: Record<string, ChartTone> = {
  brokerage: 'series1',
  private_equity: 'series2',
  employer_savings: 'series3',
  retirement: 'series4',
  savings: 'series6',
  checking: 'dim',
}
export const ACCOUNT_FALLBACK_TONES = [
  'series9',
  'series10',
  'series11',
  'series12',
] as const
