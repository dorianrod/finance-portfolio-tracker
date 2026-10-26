import { calculatePortfolioKpis } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioKpis'
import { getPerformanceTone } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceTone'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Surface } from '@/shared/ui/Surface.view'

import { Kpi } from './Kpi.view'

type Props = {
  rows: PositionRow[]
  globalTri?: number | null
}

export function KpiBar({ rows, globalTri }: Props) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const {
    activeCount,
    closedCount,
    totalDividends,
    totalInterest,
    totalRealized,
    totalReturn,
    totalUnrealized,
    totalUnrealizedNet,
    totalValue,
    totalValueNet,
    unrealizedPctGross,
    unrealizedPctNet,
  } = calculatePortfolioKpis(rows)

  return (
    <Surface
      variant="sectionEnd"
      className="mb-4 flex flex-wrap items-start gap-6 pb-4"
    >
      <Kpi.Root accent="portfolio">
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.marketValueAfterDeductingEstimatedTaxesOnUnrealizedGains',
          )}
        >
          {i18n.t('ui.kpibar.netPortfolioValue')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{formatMoney(totalValueNet)}</Kpi.Value>
        </Kpi.ValueRow>
        <Kpi.Detail>
          {i18n.t('ui.kpibar.grossWithValues', {
            amount: formatMoney(totalValue),
          })}
        </Kpi.Detail>
      </Kpi.Root>
      <Surface variant="highlighted" className="w-px" />
      <Kpi.Root accent={totalUnrealizedNet >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.unrealizedGainNetOfEstimatedTaxesTaxRateConfigurable',
          )}
        >
          {i18n.t('ui.kpibar.netUnrealizedPandl')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{formatMoney(totalUnrealizedNet)}</Kpi.Value>
        </Kpi.ValueRow>
        <Kpi.Note tone={getPerformanceTone(totalUnrealizedNet)}>
          {formatPercentage(unrealizedPctNet, { signed: true })}
        </Kpi.Note>
        <Kpi.Detail>
          {i18n.t('ui.kpibar.grossWithValues2', {
            amount: formatMoney(totalUnrealized),
            percentage: formatPercentage(unrealizedPctGross, { signed: true }),
          })}
        </Kpi.Detail>
      </Kpi.Root>
      <Surface variant="highlighted" className="w-px" />
      <Kpi.Root accent={totalRealized >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.sumOfGainsLossesCrystallizedAcrossAllSalesAcross',
          )}
        >
          {i18n.t('ui.kpibar.realizedPandl')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{formatMoney(totalRealized)}</Kpi.Value>
        </Kpi.ValueRow>
      </Kpi.Root>
      <Surface variant="highlighted" className="w-px" />
      <Kpi.Root accent="income">
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.totalDividendsReceivedAcrossAllPositionsActiveAndClosed',
          )}
        >
          {i18n.t('ui.kpibar.dividends')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{formatMoney(totalDividends)}</Kpi.Value>
        </Kpi.ValueRow>
      </Kpi.Root>
      <Surface variant="highlighted" className="w-px" />
      {totalInterest > 0 ? (
        <>
          <Kpi.Root accent="income">
            <Kpi.Label
              tooltip={i18n.t(
                'ui.kpibar.totalInterestReceivedSavingsAccountsBondsIncludedInThe',
              )}
            >
              {i18n.t('ui.kpibar.interest')}
            </Kpi.Label>
            <Kpi.ValueRow>
              <Kpi.Value>{formatMoney(totalInterest)}</Kpi.Value>
            </Kpi.ValueRow>
          </Kpi.Root>
          <Surface variant="highlighted" className="w-px" />
        </>
      ) : null}
      <Kpi.Root accent={totalReturn >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.realizedPLDividendsInterestDoesNotIncludeUnrealized',
          )}
        >
          {i18n.t('ui.kpibar.totalRealizedReturn')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{formatMoney(totalReturn)}</Kpi.Value>
        </Kpi.ValueRow>
      </Kpi.Root>
      <Surface variant="highlighted" className="w-px" />
      {globalTri == null ? null : (
        <>
          <Surface variant="highlighted" className="w-px" />
          <Kpi.Root accent={globalTri >= 0 ? 'positive' : 'negative'}>
            <Kpi.Label
              tooltip={i18n.t(
                'ui.kpibar.annualizedMoneyWeightedReturnSinceTheFirstRecordedDeposit',
              )}
            >
              {i18n.t('ui.kpibar.irrSinceTracking')}
            </Kpi.Label>
            <Kpi.ValueRow>
              <Kpi.Value tone={getPerformanceTone(globalTri)}>
                {formatPercentage(globalTri, { decimals: 2, signed: true })}
              </Kpi.Value>
            </Kpi.ValueRow>
          </Kpi.Root>
        </>
      )}
      <Surface variant="highlighted" className="w-px" />
      <Kpi.Root>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.kpibar.numberOfActivePositionsValuedTodayAndClosedPositions',
          )}
        >
          {i18n.t('ui.kpibar.positions')}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value>{activeCount}</Kpi.Value>
        </Kpi.ValueRow>
        <Kpi.Note>
          {i18n.t('ui.kpibar.closedWithValues', { closedCount })}
        </Kpi.Note>
      </Kpi.Root>
    </Surface>
  )
}
