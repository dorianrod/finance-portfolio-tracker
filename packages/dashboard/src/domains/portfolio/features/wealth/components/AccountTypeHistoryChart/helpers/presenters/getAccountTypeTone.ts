import { ACCOUNT_FALLBACK_TONES } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/constants/accountFallbackTones'
import { ACCOUNT_TONES } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/constants/accountTones'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

export function getAccountTypeTone(
  accountType: string,
  index: number,
  categories: Record<string, string>,
): ChartTone {
  return (
    ACCOUNT_TONES.get(
      Object.hasOwn(categories, accountType) ? categories[accountType] : '',
    ) ?? ACCOUNT_FALLBACK_TONES[index % ACCOUNT_FALLBACK_TONES.length]
  )
}
