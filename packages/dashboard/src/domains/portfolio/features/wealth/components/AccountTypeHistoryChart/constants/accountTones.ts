import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

export const ACCOUNT_TONES: ReadonlyMap<string, ChartTone> = new Map([
  ['brokerage', 'series1'],
  ['private_equity', 'series2'],
  ['employer_savings', 'series3'],
  ['retirement', 'series4'],
  ['savings', 'series6'],
  ['checking', 'dim'],
])
