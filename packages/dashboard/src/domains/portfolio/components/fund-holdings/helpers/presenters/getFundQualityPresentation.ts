import type { FundQualityTier } from '@/domains/portfolio/apis/queries/useFundHoldings'

export type FundQualityCategory = 'reliable' | 'partial' | 'unavailable'

export const FUND_QUALITY_LABELS: Record<FundQualityCategory, string> = {
  reliable: 'Fiable',
  partial: 'Partiel / estimé',
  unavailable: 'Non disponible',
}

export function getFundQualityPresentation(tier: FundQualityTier): {
  category: FundQualityCategory
  label: string
  sourceLabel: string
} {
  let category: FundQualityCategory = 'unavailable'
  if (tier === 'A' || tier === 'B') category = 'reliable'
  else if (tier === 'C') category = 'partial'

  let sourceLabel = 'Aucune composition exploitable'
  if (tier === 'A') sourceLabel = 'Source officielle'
  else if (tier === 'B') sourceLabel = 'Proxy exact'
  else if (tier === 'C') sourceLabel = 'Source partielle ou estimation'
  return { category, label: FUND_QUALITY_LABELS[category], sourceLabel }
}
