import i18n from '@/i18n/i18n'

export const DATA_QUALITY_DIMENSION_LABELS = {
  get geo() {
    return i18n.t('ui.builddataqualityviewmodel.geography')
  },
  get secteur() {
    return i18n.t('ui.builddataqualityviewmodel.sector')
  },
  get currency() {
    return i18n.t('ui.builddataqualityviewmodel.currency')
  },
  get classe() {
    return i18n.t('ui.builddataqualityviewmodel.assetClass')
  },
} as const
