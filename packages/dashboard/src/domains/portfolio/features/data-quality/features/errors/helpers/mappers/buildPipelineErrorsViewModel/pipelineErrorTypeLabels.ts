import i18n from '@/i18n/i18n'

export const PIPELINE_ERROR_TYPE_LABELS: Record<string, string> = {
  unresolved_ticker: i18n.t('ui.buildpipelineerrorsviewmodel.unresolvedTicker'),
  missing_price: i18n.t('ui.buildpipelineerrorsviewmodel.missingPrice'),
  missing_fx_rate: i18n.t('ui.buildpipelineerrorsviewmodel.missingFxRate'),
  parsing_error: i18n.t('ui.buildpipelineerrorsviewmodel.parsingError'),
  missing_data: i18n.t('ui.buildpipelineerrorsviewmodel.missingData'),
}
