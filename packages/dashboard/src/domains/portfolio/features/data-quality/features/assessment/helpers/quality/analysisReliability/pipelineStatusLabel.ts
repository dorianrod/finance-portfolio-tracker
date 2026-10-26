import i18n from '@/i18n/i18n'

export function pipelineStatusLabel({
  errorCount,
  warningCount,
  loading = false,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
}): string {
  if (loading) return i18n.t('ui.analysisreliability.loading')
  const issueCount = errorCount + warningCount
  if (issueCount === 0) return i18n.t('ui.analysisreliability.noAnomaly')
  return i18n.t('ui.analysisreliability.anomalyCount', { count: issueCount })
}
