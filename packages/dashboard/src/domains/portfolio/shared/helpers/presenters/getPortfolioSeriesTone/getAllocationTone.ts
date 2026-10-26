import { ALLOCATION_TONES } from '@/domains/portfolio/shared/constants/portfolioCategoryTones/allocationTones'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'

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
