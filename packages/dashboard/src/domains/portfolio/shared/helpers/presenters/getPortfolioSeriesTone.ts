import {
  ACCOUNT_FALLBACK_TONES,
  ACCOUNT_TONES,
  ALLOCATION_TONES,
} from '@/domains/portfolio/shared/constants/portfolioCategoryTones'
import { type ChartTone, getHashedSeriesTone } from '@/shared/theme/chartColors'

export function getAllocationTone(category: string): ChartTone {
  if (category === 'nc') return 'subtle'
  if (category === 'Not concerned') return 'muted'
  if (
    category === 'autre' ||
    category === 'Autre' ||
    category.startsWith('others (')
  )
    return 'dim'
  return ALLOCATION_TONES[category] ?? getHashedSeriesTone(category)
}

export function getAccountTypeTone(
  accountType: string,
  index: number,
  categories: Record<string, string>,
): ChartTone {
  return (
    ACCOUNT_TONES[categories[accountType] ?? ''] ??
    ACCOUNT_FALLBACK_TONES[index % ACCOUNT_FALLBACK_TONES.length]
  )
}
