import { createColumnHelper } from '@tanstack/react-table'

import { PositionBreakdownCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionBreakdownCell.feature'
import { PositionExpanderCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionExpanderCell.feature'
import { PositionIncomeCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionIncomeCell.feature'
import { PositionIrrCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionIrrCell.feature'
import { PositionNameCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionNameCell.feature'
import { PositionRealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionRealizedCell.feature'
import { PositionReturnCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionReturnCell.feature'
import { PositionTotalRealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionTotalRealizedCell.feature'
import { PositionUnrealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionUnrealizedCell.feature'
import { PositionValueCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionValueCell.feature'
import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
const col = createColumnHelper<TableRow>()
export const POSITION_COLUMNS = [
  col.display({
    id: 'expander',
    header: '',
    size: 24,
    cell: PositionExpanderCell,
  }),
  col.display({
    id: 'name',
    header: () => i18n.t('ui.positionstable.asset'),
    cell: PositionNameCell,
  }),
  col.display({
    id: 'value',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.currentValue')}
        tooltip={i18n.t(
          'ui.positionstable.marketValueOfThePositionAtTheLastKnown',
        )}
        col="total_value"
      />
    ),
    cell: PositionValueCell,
  }),
  col.display({
    id: 'breakdown',
    header: () => (
      <span
        title={i18n.t(
          'ui.positionstable.positionLevelAllocationAndUnderlyingExposureBreakdowns',
        )}
      >
        {i18n.t('ui.positionstable.breakdown')}
      </span>
    ),
    cell: PositionBreakdownCell,
  }),
  col.display({
    id: 'unrealized',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.unrealizedPLGross')}
        tooltip={i18n.t(
          'ui.positionstable.grossUnrealizedGainLossOnTheOpenPositionCalculation',
        )}
        col="unrealized_gain"
      />
    ),
    cell: PositionUnrealizedCell,
  }),
  col.display({
    id: 'realized',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.realizedPLGross')}
        tooltip={i18n.t(
          'ui.positionstable.grossRealizedGainsLossesOnDisposalCalculationSaleProceeds',
        )}
        col="realized_gain"
      />
    ),
    cell: PositionRealizedCell,
  }),
  col.display({
    id: 'total_realized',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.totalRealizedReturn')}
        tooltip={i18n.t(
          'ui.positionstable.cashActuallyCollectedRealizedGainsOnDisposalDividendsInterest',
        )}
        col="total_realized_return"
      />
    ),
    cell: PositionTotalRealizedCell,
  }),
  col.display({
    id: 'dividends',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.dividendsInterest')}
        tooltip={i18n.t(
          'ui.positionstable.dividendsReceivedStocksEtfsAndInterestReceivedBondsCash',
        )}
        col="total_dividends"
      />
    ),
    cell: PositionIncomeCell,
  }),
  col.display({
    id: 'total_return_pct',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.totalReturn')}
        tooltip={i18n.t(
          'ui.positionstable.grossNonAnnualizedReturnAcrossAllSourcesCalculationCurrent',
        )}
        col="total_return_pct"
      />
    ),
    cell: PositionReturnCell,
  }),
  col.display({
    id: 'xirr',
    header: () => (
      <PositionSortHeader
        label={i18n.t('ui.positionstable.annualizedIrr')}
        tooltip={i18n.t(
          'ui.positionstable.annualizedInternalRateOfReturnXirrTheMainValue',
        )}
        col="xirr"
      />
    ),
    cell: PositionIrrCell,
  }),
]
