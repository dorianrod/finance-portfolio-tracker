import { useAtomValue } from 'jotai'

import {
  useDashboardTheme,
  useDashboardThemeSync,
} from '@/domains/portfolio/shared/services/actions/useDashboardTheme'
import { dashboardThemeAtom } from '@/domains/portfolio/shared/stores/dashboardTheme.atoms'
import i18n from '@/i18n/i18n'

export function DashboardHeader() {
  const theme = useAtomValue(dashboardThemeAtom)
  const { toggleTheme } = useDashboardTheme()
  useDashboardThemeSync()

  return (
    <header className="mb-5 flex items-start gap-4">
      <div>
        <h1 className="text-2xl font-bold text-content">
          {i18n.t('ui.app.portfolio')}
        </h1>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={theme === 'dark'}
        aria-label={
          theme === 'dark'
            ? i18n.t('ui.app.switchToLightMode')
            : i18n.t('ui.app.switchToDarkMode')
        }
        className="ml-auto rounded-control border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-content-muted transition-colors hover:bg-surface-raised hover:text-content-secondary"
      >
        {theme === 'dark'
          ? i18n.t('ui.app.lightMode')
          : i18n.t('ui.app.darkMode')}
      </button>
    </header>
  )
}
