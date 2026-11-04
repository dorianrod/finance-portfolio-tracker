import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardTheme } from '@/app/services/theme/useDashboardTheme'
import { useDashboardThemeSync } from '@/app/services/theme/useDashboardThemeSync'
import { dashboardThemeAtom } from '@/app/stores/theme/dashboardTheme.store'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Text } from '@/shared/ui/Text.view'

/*
 * @architecture-decision header-independent-of-navigation
 * @rules ui-vercel-responsive-rendering
 * @choice Memoize the header while subscribing directly to its theme and translations.
 * @reason Navigation re-executes this unchanged header even though its content depends only on theme and language.
 * @alternative Comparing theme or translated props in the shell would move these inputs away from their existing owner.
 * @revisit The header displays navigation-dependent content.
 */
export const DashboardHeader = memo(function DashboardHeader() {
  const { t } = useTranslation()
  const theme = useAtomValue(dashboardThemeAtom)
  const { toggleTheme } = useDashboardTheme()
  useDashboardThemeSync()

  return (
    <header className="mb-5 flex items-start gap-4">
      <div>
        <Text as="h1" variant="title" tone="default">
          {t('ui.app.portfolio')}
        </Text>
      </div>
      <span className="inline-grid ml-auto">
        <ToggleButton
          type="button"
          onClick={toggleTheme}
          active={theme === 'dark'}
          label={
            theme === 'dark'
              ? t('ui.app.switchToLightMode')
              : t('ui.app.switchToDarkMode')
          }
          variant="secondary"
        >
          {theme === 'dark' ? t('ui.app.lightMode') : t('ui.app.darkMode')}
        </ToggleButton>
      </span>
    </header>
  )
})
