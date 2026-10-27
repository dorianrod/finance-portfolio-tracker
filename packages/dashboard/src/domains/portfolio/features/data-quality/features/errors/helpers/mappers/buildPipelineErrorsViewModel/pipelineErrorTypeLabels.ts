import i18n from '@/i18n/i18n'

export const PIPELINE_ERROR_TYPE_LABELS: Record<string, string> = {
  get unresolved_ticker() {
    return i18n.t('ui.buildpipelineerrorsviewmodel.unresolvedTicker')
  },
  get missing_price() {
    return i18n.t('ui.buildpipelineerrorsviewmodel.missingPrice')
  },
  get missing_fx_rate() {
    return i18n.t('ui.buildpipelineerrorsviewmodel.missingFxRate')
  },
  get parsing_error() {
    return i18n.t('ui.buildpipelineerrorsviewmodel.parsingError')
  },
  get missing_data() {
    return i18n.t('ui.buildpipelineerrorsviewmodel.missingData')
  },
}
