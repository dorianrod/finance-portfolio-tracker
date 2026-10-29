import { useAtomValue } from 'jotai'

import { useDashboardTheme } from '@/app/services/theme/useDashboardTheme'
import { useDashboardThemeSync } from '@/app/services/theme/useDashboardThemeSync'
import { dashboardThemeAtom } from '@/app/stores/theme/dashboardTheme.store'
import i18n from '@/i18n/i18n'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Text } from '@/shared/ui/Text.view'

export function DashboardHeader() {
  const theme = useAtomValue(dashboardThemeAtom)
  const { toggleTheme } = useDashboardTheme()
  useDashboardThemeSync()

  return (
    <header className="mb-5 flex items-start gap-4">
      <div>
        <Text as="h1" variant="title" tone="default">
          {i18n.t('ui.app.portfolio')}
        </Text>
      </div>
      <span className="inline-grid ml-auto">
        <ToggleButton
          type="button"
          onClick={toggleTheme}
          active={theme === 'dark'}
          label={
            theme === 'dark'
              ? i18n.t('ui.app.switchToLightMode')
              : i18n.t('ui.app.switchToDarkMode')
          }
          variant="secondary"
        >
          {theme === 'dark'
            ? i18n.t('ui.app.lightMode')
            : i18n.t('ui.app.darkMode')}
        </ToggleButton>
      </span>
    </header>
  )
}
