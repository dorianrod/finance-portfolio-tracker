import i18n from '@/i18n/i18n'

import type { FundQualityCategory } from './getFundQualityPresentation.types'

export const FUND_QUALITY_LABELS: Record<FundQualityCategory, string> = {
  get reliable() {
    return i18n.t('ui.getfundqualitypresentation.reliable')
  },
  get partial() {
    return i18n.t('ui.getfundqualitypresentation.partial')
  },
  get unavailable() {
    return i18n.t('ui.getfundqualitypresentation.unavailable')
  },
}
