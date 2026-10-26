import type { QualityTheme } from '@/domains/portfolio/features/data-quality/helpers/mappers/buildDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import i18n from '@/i18n/i18n'
import { Select } from '@/shared/ui/Controls.view'
import { Layout, Stack } from '@/shared/ui/Layout.view'
import { Tabs } from '@/shared/ui/Tabs.view'
import { Text } from '@/shared/ui/Text.view'

import { QualityThemeOption, QualityThemeTab } from './DataQualityDetails.view'

export function QualityThemeNavigation({
  themes,
  activeThemeId,
  onThemeChange,
}: {
  themes: QualityTheme[]
  activeThemeId: QualityThemeId
  onThemeChange: (theme: QualityThemeId) => void
}) {
  return (
    <>
      <Layout hideFrom="medium">
        <Layout spaceAfter="default">
          <Text
            htmlFor="quality-theme"
            as="label"
            variant="captionLabel"
            tone="subtle"
          >
            <Layout as="span" flow="block">
              {i18n.t('ui.dataqualitytab.qualityTheme')}
            </Layout>
          </Text>
        </Layout>
        <Layout as="span" flow="control" width="full">
          <Select
            label={i18n.t('ui.dataqualitytab.qualityTheme')}
            id="quality-theme"
            value={activeThemeId}
            onChange={(event) =>
              onThemeChange(event.target.value as QualityThemeId)
            }
            variant="stacked"
          >
            {themes.map((theme) => (
              <QualityThemeOption key={theme.id} theme={theme} />
            ))}
          </Select>
        </Layout>
      </Layout>

      <Tabs.List
        variant="sidebar"
        label={i18n.t('ui.dataqualitytab.dataQualityThemes')}
      >
        <Stack gap="compact" inset="default">
          {themes.map((theme) => (
            <QualityThemeTab
              key={theme.id}
              activeThemeId={activeThemeId}
              theme={theme}
            />
          ))}
        </Stack>
      </Tabs.List>
    </>
  )
}
