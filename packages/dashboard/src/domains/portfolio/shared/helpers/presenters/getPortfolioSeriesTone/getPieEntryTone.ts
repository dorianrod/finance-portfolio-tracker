import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

import { getAllocationTone } from './getAllocationTone'

export function getPieEntryTone(
  entry: Pick<PieEntry, 'name' | 'subItems'>,
): ChartTone {
  if (entry.subItems && entry.subItems.length > 1) return 'dim'
  return getAllocationTone(entry.name)
}
