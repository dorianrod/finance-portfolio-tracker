import { useAtomValue } from 'jotai'

import {
  useDashboardTheme,
  useDashboardThemeSync,
} from '@/domains/portfolio/shared/services/actions/useDashboardTheme'
import { dashboardThemeAtom } from '@/domains/portfolio/shared/stores/dashboardTheme.atoms'
import i18n from '@/i18n/i18n'
import { ToggleButton } from '@/shared/ui/Controls.view'
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
        className="ml-auto px-3 py-2"
      >
        {theme === 'dark'
          ? i18n.t('ui.app.lightMode')
          : i18n.t('ui.app.darkMode')}
      </ToggleButton>
    </header>
  )
}
