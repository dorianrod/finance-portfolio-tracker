import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment, useMemo } from 'react'

import {
  FundPositionPopover,
  type FundPositionPopoverTarget,
} from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover.feature'
import {
  type ChartTarget,
  HoverChart,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import {
  HoverSavingsChart,
  type SavingsChartTarget,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
import {
  isClosedPosition,
  isTaxFreePassiveIncome,
} from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/positionDisplayRules'
import {
  calculatePassiveIncomeTax,
  calculatePositionGroupTotals,
  shouldShowPositionQuantity,
} from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues'
import { formatIrrPeriodLabel } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/formatIrrPeriodLabel'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import {
  getPositionSavingsOperations,
  getPositionTradeOperations,
} from '@/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations'
import { gainClass } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainClass'
import { usePositionTableData } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableData'
import { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays'
import { usePositionTableState } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableState'
import {
  type AllocationHoverTarget,
  HoverAllocationPopover,
} from '@/domains/portfolio/shared/components/HoverAllocationPopover.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { statusForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import {
  SEMANTIC_BADGE_CLASSES,
  SEMANTIC_TEXT_CLASSES,
} from '@/shared/theme/semanticColors'
import { DATA_TABLE_STYLES } from '@/shared/ui/tableStyles'

import { ExpandBtn } from './ExpandBtn.view'
import { GainCell } from './GainCell.view'
import { RealizedGainCell, UnrealizedGainCell } from './GainCells.feature'
import { PositionSortHeader } from './PositionSortHeader.feature'
import {
  type CellHandlers,
  PositionBodyCell,
  PositionHeaderRow,
} from './PositionTableCells.view'
import { UnderlyingStatusControl } from './UnderlyingStatusControl.feature'

const EMPTY_FUND_STATUSES: FundHoldingStatus[] = []

const col = createColumnHelper<TableRow>()

type Props = {
  data: PositionRow[]
  fundStatuses?: FundHoldingStatus[]
  grouping?: 'flat' | 'account-type'
}

type PositionGroupTotals =
  ReturnType<typeof calculatePositionGroupTotals> extends Map<
    string,
    infer Totals
  >
    ? Totals
    : never

type PositionBodyRowProps = {
  cancelHide: () => void
  row: Row<TableRow>
  scheduleHide: () => void
  separatorType?: string
  setAllocationHover: React.Dispatch<
    React.SetStateAction<AllocationHoverTarget | null>
  >
  setChart: React.Dispatch<React.SetStateAction<ChartTarget | null>>
  setSavingsChart: React.Dispatch<
    React.SetStateAction<SavingsChartTarget | null>
  >
  setUnderlyingPopover: React.Dispatch<
    React.SetStateAction<FundPositionPopoverTarget | null>
  >
  totals?: PositionGroupTotals
}

function PositionBodyRow({
  cancelHide,
  row,
  scheduleHide,
  separatorType,
  setAllocationHover,
  setChart,
  setSavingsChart,
  setUnderlyingPopover,
  totals,
}: PositionBodyRowProps) {
  const formatMoney = useFormatMoney()
  const item = row.original
  const isPosition = item.kind === 'position'
  const isGroup = item.kind === 'group'
  let rootRow = row
  while (rootRow.getParentRow()) rootRow = rootRow.getParentRow()!
  const isClosed = isClosedPosition(rootRow.original)
  const isTradeGroup = item.kind === 'group' && item.groupType === 'trades'
  let chartHandlers: CellHandlers = null
  if (isTradeGroup) {
    const parent = row.getParentRow()?.original
    if (parent?.kind === 'position') {
      const name = parent.name
      const positionKey = parent.isin || parent.ticker || name
      if (positionKey)
        chartHandlers = {
          onMouseEnter: (event) => {
            cancelHide()
            setSavingsChart(null)
            setAllocationHover(null)
            setUnderlyingPopover(null)
            setChart({
              isin: positionKey,
              name,
              operations: getPositionTradeOperations(parent),
              buttonRect: event.currentTarget.getBoundingClientRect(),
            })
          },
          onMouseLeave: scheduleHide,
        }
    }
  }
  const isSavingsGroup = item.kind === 'group' && item.groupType === 'cash'
  let savingsHandlers: CellHandlers = null
  if (isSavingsGroup) {
    const parent = row.getParentRow()?.original
    if (parent?.kind === 'position')
      savingsHandlers = {
        onMouseEnter: (event) => {
          cancelHide()
          setChart(null)
          setAllocationHover(null)
          setUnderlyingPopover(null)
          setSavingsChart({
            name: parent.name,
            operations: getPositionSavingsOperations(parent),
            buttonRect: event.currentTarget.getBoundingClientRect(),
          })
        },
        onMouseLeave: scheduleHide,
      }
  }
  const td =
    'px-3 py-1.5 text-xs bg-surface-raised border-t-2 border-border-strong border-b border-border-strong'

  return (
    <Fragment>
      {separatorType !== undefined && (
        <tr>
          <td className={td} />
          <td
            className={`${td} font-semibold uppercase tracking-widest text-content-muted`}
          >
            {separatorType || i18n.t('ui.positionstable.other')}
          </td>
          <td className={`${td} font-medium text-content-secondary`}>
            {totals && totals.value > 0 ? formatMoney(totals.value) : ''}
          </td>
          <td className={td} />
          <td className={`${td} ${totals ? gainClass(totals.unrealized) : ''}`}>
            {totals && totals.unrealized !== 0
              ? formatMoney(totals.unrealized)
              : ''}
          </td>
          <td className={`${td} ${totals ? gainClass(totals.realized) : ''}`}>
            {totals && totals.realized !== 0
              ? formatMoney(totals.realized)
              : ''}
          </td>
          <td
            className={`${td} ${totals ? gainClass(totals.totalRealized) : ''}`}
          >
            {totals && totals.totalRealized !== 0
              ? formatMoney(totals.totalRealized)
              : ''}
          </td>
          <td className={`${td} ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}>
            {totals && totals.dividends !== 0
              ? formatMoney(totals.dividends)
              : ''}
          </td>
          <td className={td} />
          <td className={td} />
        </tr>
      )}
      <tr
        className={[
          'border-b transition-colors',
          isClosed
            ? 'border-border opacity-40 hover:opacity-70'
            : 'border-border',
          isPosition && !isClosed
            ? 'cursor-pointer bg-surface hover:bg-surface-raised'
            : '',
          isPosition && isClosed ? 'cursor-pointer bg-canvas' : '',
          isGroup && !isClosed
            ? 'bg-surface-raised cursor-pointer hover:bg-surface-raised'
            : '',
          isGroup && isClosed ? 'cursor-pointer bg-canvas' : '',
          !isPosition && !isGroup ? 'bg-canvas' : '',
        ].join(' ')}
        onClick={
          row.getCanExpand() ? row.getToggleExpandedHandler() : undefined
        }
      >
        {row.getVisibleCells().map((cell) => (
          <PositionBodyCell
            key={cell.id}
            cell={cell}
            chartHandlers={chartHandlers}
            savingsHandlers={savingsHandlers}
          />
        ))}
      </tr>
    </Fragment>
  )
}

export function PositionsTable({
  data,
  grouping = 'flat',
  fundStatuses = EMPTY_FUND_STATUSES,
}: Props) {
  const { formatDate, formatMoney, formatNumber, formatPercentage } =
    usePositionTableFormatters()
  const { expanded, setExpanded } = usePositionTableState()
  const {
    allocationHover,
    cancelHide,
    chart,
    savingsChart,
    scheduleHide,
    setAllocationHover,
    setChart,
    setSavingsChart,
    setUnderlyingPopover,
    underlyingPopover,
  } = usePositionTableOverlays()
  const { allocationData, groupTotals } = usePositionTableData(data)

  const columns = useMemo(
    () => [
      col.display({
        id: 'expander',
        header: '',
        size: 24,
        cell: ({ row }) => (
          <span
            style={{ paddingLeft: `${row.depth * 20}px` }}
            className="flex items-center gap-1"
          >
            <ExpandBtn row={row} />
          </span>
        ),
      }),
      col.display({
        id: 'name',
        header: i18n.t('ui.positionstable.asset'),
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            const hasIdentifier = Boolean(r.ticker || r.isin)
            const showIdentifierSeparator = Boolean(r.isin && r.ticker)
            return (
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-content">{r.name}</span>
                  {r.status === 'closed' && (
                    <span className="text-xs bg-surface-hover text-content-muted px-1.5 py-0.5 rounded">
                      {i18n.t('ui.positionstable.closed')}
                    </span>
                  )}
                </span>
                {hasIdentifier && (
                  <span className="flex items-center gap-1.5">
                    {r.isin && (
                      <span className="text-xs text-content-subtle font-mono">
                        {r.isin}
                      </span>
                    )}
                    {showIdentifierSeparator && (
                      <span className="text-content-subtle text-xs">·</span>
                    )}
                    {r.ticker && (
                      <span className="text-xs text-content-muted font-mono">
                        {r.ticker}
                      </span>
                    )}
                  </span>
                )}
              </span>
            )
          }
          if (r.kind === 'group') {
            return (
              <span className="text-sm font-semibold text-content-secondary">
                {r.label}
              </span>
            )
          }
          if (r.kind === 'operation') {
            let operationClass: string = SEMANTIC_BADGE_CLASSES.transactionOther
            if (r.operation_type === 'BUY')
              operationClass = SEMANTIC_BADGE_CLASSES.transactionBuy
            else if (r.operation_type === 'SELL')
              operationClass = SEMANTIC_BADGE_CLASSES.transactionSell
            return (
              <span className="flex items-center gap-2 text-sm">
                <span
                  className={`font-mono text-xs px-1.5 py-0.5 rounded ${operationClass}`}
                >
                  {r.operation_type}
                </span>
                <span className="text-content-muted">
                  {formatDate(r.date, { style: 'isoDate' })}
                </span>
                <span className="text-content-subtle text-xs">{r.account}</span>
              </span>
            )
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            const showQuantity = shouldShowPositionQuantity(r)
            return (
              <span className="flex flex-col leading-tight">
                <span className="flex items-center gap-1">
                  {r.total_value == null ? (
                    <span className="text-content-subtle">—</span>
                  ) : (
                    <span className="text-content font-medium">
                      {formatMoney(r.total_value)}
                    </span>
                  )}
                </span>
                {showQuantity && (
                  <span className="text-[10px] text-content-subtle mt-0.5">
                    {formatNumber(r.quantity!, { maximumFractionDigits: 0 })}
                    {r.last_price != null && (
                      <> · {formatMoney(r.last_price, { style: 'decimal' })}</>
                    )}
                  </span>
                )}
              </span>
            )
          }
          if (r.kind === 'group' && r.total_invested != null) {
            return (
              <span className="text-xs text-content-muted flex flex-col gap-0.5">
                <span className="underline decoration-dashed decoration-border-strong underline-offset-2">
                  {i18n.t('ui.positionstable.invested')}{' '}
                  {formatMoney(r.total_invested)}
                </span>
                {r.avg_buy_price != null && (
                  <span className="text-content-subtle">
                    {i18n.t('ui.positionstable.avgPrice')}{' '}
                    {formatMoney(r.avg_buy_price, { style: 'decimal' })}
                    <span className="ml-1 opacity-40 text-[9px]">▲</span>
                  </span>
                )}
              </span>
            )
          }
          if (r.kind === 'group' && r.groupType === 'cash') {
            return (
              <span className="text-xs flex flex-col gap-0.5">
                <span
                  className={`${SEMANTIC_TEXT_CLASSES.netContributionsDetail} ${SEMANTIC_TEXT_CLASSES.netContributionsDecoration} underline decoration-dashed underline-offset-2`}
                >
                  {i18n.t('ui.positionstable.deposited')}{' '}
                  {formatMoney(r.deposit_total ?? 0)}
                </span>
                {(r.withdrawal_total ?? 0) > 0 && (
                  <span className={SEMANTIC_TEXT_CLASSES.outflowDetail}>
                    {i18n.t('ui.positionstable.withdrawn')}{' '}
                    {formatMoney(r.withdrawal_total ?? 0)}
                  </span>
                )}
              </span>
            )
          }
          if (r.kind === 'operation') {
            return (
              <span className="text-sm text-content-secondary">
                {formatMoney(Math.abs(r.total_amount), { style: 'decimal' })}
              </span>
            )
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind !== 'position') return null
          const allocKey = r.isin || `NC-${r.name}`
          const allocation = allocationData.get(allocKey)
          const fundStatus = statusForPosition(r, fundStatuses)
          const hasNoBreakdown = !allocation && !fundStatus
          const showAllocation = (button: HTMLButtonElement) => {
            if (!allocation) return
            cancelHide()
            setChart(null)
            setSavingsChart(null)
            setUnderlyingPopover(null)
            setAllocationHover({
              isin: allocKey,
              name: r.name,
              buttonRect: button.getBoundingClientRect(),
              allocation,
            })
          }
          const showUnderlying = (button: HTMLButtonElement) => {
            if (!fundStatus) return
            cancelHide()
            setChart(null)
            setSavingsChart(null)
            setAllocationHover(null)
            setUnderlyingPopover({
              position: r,
              status: fundStatus,
              buttonRect: button.getBoundingClientRect(),
            })
          }
          return (
            <span className="relative mx-auto grid w-[68px] grid-cols-2 place-items-center gap-1">
              {allocation && (
                <button
                  type="button"
                  aria-label={i18n.t(
                    'ui.positionstable.viewAllocationsForValue0',
                    {
                      value0: r.name,
                    },
                  )}
                  title={i18n.t('ui.positionstable.viewAssetAllocations')}
                  className="shrink-0 rounded p-1.5 text-content-subtle transition-colors hover:bg-surface-hover hover:text-accent focus-visible:bg-surface-hover focus-visible:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                  onMouseEnter={(event) => showAllocation(event.currentTarget)}
                  onMouseLeave={scheduleHide}
                  onFocus={(event) => showAllocation(event.currentTarget)}
                  onBlur={scheduleHide}
                  onClick={(event) => {
                    event.stopPropagation()
                    showAllocation(event.currentTarget)
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7.75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 2.25A7.75 7.75 0 0 1 17.75 10H10Z"
                      fill="currentColor"
                    />
                    <path
                      d="M10 10 4.52 15.48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              )}
              {!allocation && (
                <span className="block size-8" aria-hidden="true" />
              )}
              {fundStatus && (
                <UnderlyingStatusControl
                  // eslint-disable-next-line local/no-prop-drilling -- The table checks action availability; the control receives the matching API entity and owns only popover selection.
                  status={fundStatus}
                  assetName={r.name}
                  positionId={r.id}
                  onShow={showUnderlying}
                  onHide={scheduleHide}
                />
              )}
              {!fundStatus && (
                <span className="block size-8" aria-hidden="true" />
              )}
              {hasNoBreakdown && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-content-subtle">
                  —
                </span>
              )}
            </span>
          )
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            return <UnrealizedGainCell position={r} />
          }
          if (r.kind === 'operation' && r.operation_type === 'BUY') {
            if (r.quantity == null) return null
            return (
              <span className="text-xs text-content-muted">
                {formatNumber(r.quantity, { maximumFractionDigits: 2 })} ×{' '}
                {r.price_per_unit == null
                  ? '—'
                  : formatMoney(r.price_per_unit, { style: 'decimal' })}
              </span>
            )
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            return <RealizedGainCell position={r} />
          }
          if (r.kind === 'group' && r.groupType === 'trades') {
            return (
              <span className="text-xs space-x-2">
                <span className="text-content-muted">
                  {i18n.t('ui.positionstable.sold')}{' '}
                  {formatMoney(r.total_sold ?? 0)}
                </span>
                <GainCell value={r.realized_pnl ?? null} />
              </span>
            )
          }
          if (r.kind === 'operation' && r.realized_gain != null) {
            return <GainCell value={r.realized_gain} />
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            return r.total_realized_return === 0 ? (
              <span className="text-content-subtle">—</span>
            ) : (
              <GainCell value={r.total_realized_return} />
            )
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind === 'position') {
            const hasDivs = r.total_dividends > 0
            const hasInt = r.total_interest > 0
            if (!hasDivs && !hasInt)
              return <span className="text-content-subtle">—</span>
            const divTax = calculatePassiveIncomeTax(
              r.total_dividends,
              r.total_dividends_net,
              r.tax_rate,
            )
            const intTax = calculatePassiveIncomeTax(
              r.total_interest,
              r.total_interest_net,
              r.tax_rate,
            )
            const displayedDividendTax =
              divTax != null && divTax > 0 ? divTax : null
            const displayedInterestTax =
              intTax != null && intTax > 0 ? intTax : null
            return (
              <span className="flex flex-col leading-tight text-xs">
                <span className="space-x-2">
                  {hasDivs && (
                    <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>
                      {formatMoney(r.total_dividends)}
                    </span>
                  )}
                  {hasInt && (
                    <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>
                      {formatMoney(r.total_interest)}{' '}
                      {i18n.t('ui.positionstable.int')}
                    </span>
                  )}
                </span>
                {displayedDividendTax != null && (
                  <span className="text-[10px] text-content-subtle mt-0.5">
                    ~{formatMoney(-displayedDividendTax)}{' '}
                    {i18n.t('ui.positionstable.taxOnDiv')}
                    {formatPercentage(r.tax_rate! * 100, { decimals: 0 })})
                  </span>
                )}
                {displayedInterestTax != null && (
                  <span className="text-[10px] text-content-subtle mt-0.5">
                    ~{formatMoney(-displayedInterestTax)}{' '}
                    {i18n.t('ui.positionstable.taxOnInt')}
                    {formatPercentage(r.tax_rate! * 100, { decimals: 0 })})
                  </span>
                )}
                {isTaxFreePassiveIncome(r) && (
                  <span className="text-[10px] text-content-subtle mt-0.5">
                    {i18n.t('ui.positionstable.net0Tax')}
                  </span>
                )}
              </span>
            )
          }
          if (r.kind === 'group' && r.groupType === 'dividends') {
            return (
              <span className="text-xs space-x-2">
                <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>
                  {formatMoney(r.total_dividends ?? 0)}
                </span>
                <span className="text-content-muted">
                  ({r.dividend_count} {i18n.t('ui.positionstable.payments')}
                  {formatMoney(r.annualized_dividends ?? 0)}
                  {i18n.t('ui.positionstable.yr')}
                </span>
              </span>
            )
          }
          if (r.kind === 'group' && r.groupType === 'interest') {
            return (
              <span className="text-xs space-x-2">
                <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>
                  {formatMoney(r.total_interest ?? 0)}
                </span>
                <span className="text-content-muted">
                  ({r.interest_count}{' '}
                  {i18n.t('ui.positionstable.payments.137c46')}
                </span>
              </span>
            )
          }
          if (r.kind === 'operation' && r.operation_type === 'DIVIDEND') {
            return (
              <span
                className={`text-sm ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}
              >
                {formatMoney(r.total_amount, { style: 'decimal' })}
              </span>
            )
          }
          if (r.kind === 'operation' && r.operation_type === 'INTEREST') {
            return (
              <span
                className={`text-sm ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}
              >
                {formatMoney(r.total_amount, { style: 'decimal' })}
              </span>
            )
          }
          return null
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (r.kind !== 'position' || r.total_return_pct == null) return null
          return (
            <span className={gainClass(r.total_return_pct)}>
              {formatPercentage(r.total_return_pct, {
                decimals: 2,
                signed: true,
              })}
            </span>
          )
        },
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
        cell: ({ row }) => {
          const r = row.original
          if (
            r.kind !== 'position' ||
            (r.xirr == null && r.xirr_rolling_3y == null)
          )
            return null
          return (
            <span className="flex flex-col leading-tight">
              {r.xirr != null && (
                <span className={gainClass(r.xirr)}>
                  {formatPercentage(r.xirr, { decimals: 2, signed: true })}
                  <span className="ml-0.5 text-xs opacity-60">
                    {i18n.t('ui.positionstable.yr.22ed45')}
                  </span>
                </span>
              )}
              {r.xirr != null && (
                <span className="mt-0.5 text-[10px] text-content-subtle">
                  {formatIrrPeriodLabel(r.xirr_rolling_period_years)}:{' '}
                  {r.xirr_rolling_3y == null
                    ? '—'
                    : i18n.t('ui.positionstable.value0Yr', {
                        value0: formatPercentage(r.xirr_rolling_3y, {
                          decimals: 2,
                          signed: true,
                        }),
                      })}
                </span>
              )}
            </span>
          )
        },
      }),
    ],
    [
      allocationData,
      cancelHide,
      formatDate,
      formatMoney,
      formatNumber,
      formatPercentage,
      fundStatuses,
      scheduleHide,
      setAllocationHover,
      setChart,
      setSavingsChart,
      setUnderlyingPopover,
    ],
  )

  // @tanstack/react-table returns fresh row/column helper functions on every
  // call, which the React Compiler can never safely memoize — not fixable here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TableRow>({
    data,
    columns,
    getSubRows: (row) => {
      if (row.kind === 'position') return row.subRows
      if (row.kind === 'group') return row.subRows
      return undefined
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
  })
  let previousAccountType: string | undefined
  const bodyRows = table.getRowModel().rows.map((row) => {
    const item = row.original
    let separatorType: string | undefined
    let totals: PositionGroupTotals | undefined
    if (
      grouping === 'account-type' &&
      item.kind === 'position' &&
      row.depth === 0
    ) {
      const currentType = item.account_type ?? ''
      if (currentType !== previousAccountType) {
        previousAccountType = currentType
        separatorType = currentType
        totals = groupTotals.get(currentType)
      }
    }
    return { row, separatorType, totals }
  })

  return (
    <section className={DATA_TABLE_STYLES.panel}>
      <div className={DATA_TABLE_STYLES.toolbar}>
        <div>
          <h2 className={`${DATA_TABLE_STYLES.title} flex items-center`}>
            {i18n.t('ui.positionstable.allPortfolioPositions')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.positionstable.positionsAreValuedAtPeriodEndExpandedTransactionAnd',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </h2>
          <p className={DATA_TABLE_STYLES.description}>
            {i18n.t(
              'ui.positionstable.expandEachPositionToReviewItsTransactionsAndIncome',
            )}
          </p>
          <p className="mt-1 text-[10px] text-content-subtle">
            {i18n.t(
              'ui.positionstable.transactionAndIncomeAmountsUseTheSelectedPeriod',
            )}
          </p>
        </div>
        <div className={DATA_TABLE_STYLES.actions}>
          <button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(true)}
            className="flex-1 rounded-lg border border-border-strong bg-canvas px-3 py-2 text-xs text-content-secondary transition-colors hover:border-border-strong hover:text-content sm:flex-none"
          >
            {i18n.t('ui.positionstable.expandAll')}
          </button>
          <button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(false)}
            className="flex-1 rounded-lg border border-border-strong bg-canvas px-3 py-2 text-xs text-content-secondary transition-colors hover:border-border-strong hover:text-content sm:flex-none"
          >
            {i18n.t('ui.positionstable.collapseAll')}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full min-w-[1100px] text-sm text-left table-fixed">
          <colgroup>
            <col style={{ width: '28px' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead className={DATA_TABLE_STYLES.columnHeader}>
            {table.getHeaderGroups().map((group) => (
              <PositionHeaderRow key={group.id} group={group} />
            ))}
          </thead>
          <tbody>
            {bodyRows.map((item) => (
              <PositionBodyRow
                key={item.row.id}
                cancelHide={cancelHide}
                row={item.row}
                scheduleHide={scheduleHide}
                separatorType={item.separatorType}
                setAllocationHover={setAllocationHover}
                setChart={setChart}
                setSavingsChart={setSavingsChart}
                setUnderlyingPopover={setUnderlyingPopover}
                totals={item.totals}
              />
            ))}
          </tbody>
        </table>
      </div>

      {chart && (
        <HoverChart
          target={chart}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {savingsChart && (
        <HoverSavingsChart
          target={savingsChart}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {allocationHover && (
        <HoverAllocationPopover
          target={allocationHover}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {underlyingPopover && (
        <FundPositionPopover
          target={underlyingPopover}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}
    </section>
  )
}
