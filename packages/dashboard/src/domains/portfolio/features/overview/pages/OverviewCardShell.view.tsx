import type { ReactNode } from 'react'

import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { FilterScopeContext } from '@/domains/portfolio/shared/types/filterScopeContext.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { MetricCard, type MetricCardAccent } from '@/shared/ui/MetricCard.view'
import { Text } from '@/shared/ui/Text.view'

export function OverviewCardShell({
  title,
  description,
  scope,
  scopeContext,
  eyebrow,
  onOpen,
  accent,
  children,
}: {
  title: string
  description: string
  scope: FilterScopeSpec
  scopeContext: FilterScopeContext
  eyebrow: string
  onOpen: () => void
  accent: MetricCardAccent
  children: ReactNode
}) {
  return (
    <MetricCard
      accent={accent}
      onOpen={onOpen}
      label={i18n.t('ui.overviewsummarycards.openValue0Details', {
        value0: title,
      })}
    >
      <MetricCard.Header>
        <Text variant="prominentEyebrow" tone="subtle">
          <Layout as="span" flow="block">
            {eyebrow}
          </Layout>
        </Text>
        <Layout as="span" flow="block" spaceBefore="compact">
          <Text variant="bodyStrong" tone="secondary">
            <Inline as="span" align="center">
              {title}
              <MetricCard.Action>
                <InfoTooltip text={description}>
                  <InfoTooltip.Footer>
                    <FilterScopePresentation
                      scope={scope}
                      scopeContext={scopeContext}
                    />
                  </InfoTooltip.Footer>
                </InfoTooltip>
              </MetricCard.Action>
            </Inline>
          </Text>
        </Layout>
      </MetricCard.Header>
      <MetricCard.Body>{children}</MetricCard.Body>
    </MetricCard>
  )
}
