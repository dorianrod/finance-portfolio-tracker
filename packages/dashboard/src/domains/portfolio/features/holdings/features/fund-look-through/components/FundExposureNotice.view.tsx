import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function FundExposureNotice({
  applicable,
  children,
}: {
  applicable: boolean
  children: ReactNode
}) {
  return (
    <Surface as="section" variant="card">
      <Text as="h2" variant="strong" tone="secondary">
        <Inline as="span" align="center">
          {applicable
            ? i18n.t('ui.fundlookthroughtab.noIdentifiedUnderlyingExposureYet')
            : i18n.t('ui.fundlookthroughtab.underlyingExposureNotApplicable')}
          {children}
        </Inline>
      </Text>
      <Layout spaceBefore="compact">
        <Text as="p" variant="body" tone="subtle">
          {applicable
            ? i18n.t(
                'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
              )
            : i18n.t(
                'ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking',
              )}
        </Text>
      </Layout>
    </Surface>
  )
}
