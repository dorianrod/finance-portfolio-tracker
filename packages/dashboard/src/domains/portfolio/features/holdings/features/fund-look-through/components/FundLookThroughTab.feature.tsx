import { FundHoldingsExplorer } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/FundHoldingsExplorer.feature'
import { selectExposurePositions } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/selectors/selectExposurePositions'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function FundLookThroughTab({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const applicablePositions = selectExposurePositions(positions)

  let content = (
    <Surface as="section" variant="card">
      <Text as="h2" variant="strong" tone="secondary">
        <Inline as="span" align="center">
          {i18n.t('ui.fundlookthroughtab.noIdentifiedUnderlyingExposureYet')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
            )}
            scope={{ account: 'filterable', period: 'as-of' }}
          />
        </Inline>
      </Text>
      <Layout spaceBefore="compact">
        <Text as="p" variant="body" tone="subtle">
          {i18n.t(
            'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
          )}
        </Text>
      </Layout>
    </Surface>
  )
  if (applicablePositions.length === 0) {
    content = (
      <Surface as="section" variant="card">
        <Text as="h2" variant="strong" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.fundlookthroughtab.underlyingExposureNotApplicable')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="body" tone="subtle">
            {i18n.t(
              'ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking',
            )}
          </Text>
        </Layout>
      </Surface>
    )
  } else if (holdings.length > 0) {
    content = <FundHoldingsExplorer positions={positions} holdings={holdings} />
  }

  return <div className="mb-6 space-y-4">{content}</div>
}
