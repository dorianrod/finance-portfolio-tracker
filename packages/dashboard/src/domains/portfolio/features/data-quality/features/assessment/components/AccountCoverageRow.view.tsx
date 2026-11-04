import type { summarizeAllocationCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/computeAllocationCoverage/summarizeAllocationCoverage'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function AccountCoverageRowView({
  label,
  coverage,
  summaryValues,
}: {
  label: string
  coverage: AccountCoverage
  summaryValues: ReturnType<typeof summarizeAllocationCoverage>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { allocatedPct, unallocatedPct, notApplicablePct } = summaryValues
  const summary =
    coverage.allocated + coverage.unallocated > 0
      ? i18n.t('ui.allocationcoveragecard.allocatedSummary', {
          amount: formatMoney(coverage.allocated, { style: 'full' }),
          percentage: formatPercentage(allocatedPct),
        })
      : i18n.t('ui.allocationcoveragecard.notApplicableSummary', {
          amount: formatMoney(coverage.notApplicable, { style: 'full' }),
        })
  const detail = i18n.t('ui.allocationcoveragecard.accountCoverageDetail', {
    allocated: formatMoney(coverage.allocated, { style: 'full' }),
    unallocated: formatMoney(coverage.unallocated, { style: 'full' }),
    notApplicable: formatMoney(coverage.notApplicable, { style: 'full' }),
  })
  return (
    <div>
      <Inline
        as="div"
        spaceAfter="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text variant="caption" tone="muted" truncate title={label}>
          {label}
        </Text>
        <Layout as="span" flow="inline" sizing="fixed">
          <Text variant="micro" tone="subtle" numeric>
            {summary}
          </Text>
        </Layout>
      </Inline>
      <Layout height="track" overflow="clip">
        <Surface variant="track" title={detail}>
          <Inline as="div" height="full">
            {coverage.allocated > 0 && (
              <SeriesSwatch
                as="div"
                tone={PORTFOLIO_CHART_TONES.coverage}
                share={allocatedPct}
              />
            )}
            {coverage.unallocated > 0 && (
              <SeriesSwatch
                as="div"
                tone={PORTFOLIO_CHART_TONES.coverageGap}
                share={unallocatedPct}
              />
            )}
            {coverage.notApplicable > 0 && (
              <ToneSwatch as="div" tone="subtle" share={notApplicablePct} />
            )}
          </Inline>
        </Surface>
      </Layout>
    </div>
  )
}
