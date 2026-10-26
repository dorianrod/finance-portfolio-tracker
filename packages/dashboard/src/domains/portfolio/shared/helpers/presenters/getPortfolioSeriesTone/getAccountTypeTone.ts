import { ACCOUNT_FALLBACK_TONES } from '@/domains/portfolio/shared/constants/portfolioCategoryTones/accountFallbackTones'
import { ACCOUNT_TONES } from '@/domains/portfolio/shared/constants/portfolioCategoryTones/accountTones'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

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
