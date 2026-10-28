import { createColumnHelper } from '@tanstack/react-table'

import { PositionBreakdownCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionBreakdownCell.feature'
import { PositionExpanderCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionExpanderCell.view'
import { PositionIncomeCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionIncomeCell.feature'
import { PositionIrrCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionIrrCell.view'
import { PositionNameCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionNameCell.view'
import { PositionRealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionRealizedCell.feature'
import { PositionReturnCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionReturnCell.view'
import { PositionTotalRealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionTotalRealizedCell.view'
import { PositionUnrealizedCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionUnrealizedCell.feature'
import { PositionValueCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionValueCell.feature'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'

import { PositionBreakdownHeader } from './positionColumnHeaders/PositionBreakdownHeader.view'
import { PositionDividendsHeader } from './positionColumnHeaders/PositionDividendsHeader.feature'
import { PositionRealizedHeader } from './positionColumnHeaders/PositionRealizedHeader.feature'
import { PositionTotalRealizedHeader } from './positionColumnHeaders/PositionTotalRealizedHeader.feature'
import { PositionTotalReturnPctHeader } from './positionColumnHeaders/PositionTotalReturnPctHeader.feature'
import { PositionUnrealizedHeader } from './positionColumnHeaders/PositionUnrealizedHeader.feature'
import { PositionValueHeader } from './positionColumnHeaders/PositionValueHeader.feature'
import { PositionXirrHeader } from './positionColumnHeaders/PositionXirrHeader.feature'
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
    header: PositionValueHeader,
    cell: PositionValueCell,
  }),
  col.display({
    id: 'breakdown',
    header: PositionBreakdownHeader,
    cell: PositionBreakdownCell,
  }),
  col.display({
    id: 'unrealized',
    header: PositionUnrealizedHeader,
    cell: PositionUnrealizedCell,
  }),
  col.display({
    id: 'realized',
    header: PositionRealizedHeader,
    cell: PositionRealizedCell,
  }),
  col.display({
    id: 'total_realized',
    header: PositionTotalRealizedHeader,
    cell: PositionTotalRealizedCell,
  }),
  col.display({
    id: 'dividends',
    header: PositionDividendsHeader,
    cell: PositionIncomeCell,
  }),
  col.display({
    id: 'total_return_pct',
    header: PositionTotalReturnPctHeader,
    cell: PositionReturnCell,
  }),
  col.display({
    id: 'xirr',
    header: PositionXirrHeader,
    cell: PositionIrrCell,
  }),
]
