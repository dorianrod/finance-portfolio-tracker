import i18n from '@/i18n/i18n'

export function DashboardPanelFallback() {
  return (
    <div className="mb-6 rounded-card border border-border bg-surface/50 p-8 text-center text-sm text-content-subtle">
      {i18n.t('ui.app.loadingAnalysis')}
    </div>
  )
}
