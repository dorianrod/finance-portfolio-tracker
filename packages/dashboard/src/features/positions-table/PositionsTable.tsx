import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { ExpandedState, OnChangeFn } from '@tanstack/react-table'
import { Fragment, useMemo, useRef, useState } from 'react'
import type { PositionRow, TableRow } from '@/types/domain'
import type { SortKey } from '@/types/filters'
import { fmt, fmtDec, fmtPct, fmtQty } from '@/shared/format/money'
import { SEMANTIC_BADGE_CLASSES, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { gainClass } from './positionsTable.logic'
import { GainCell, UnrealizedGainCell, RealizedGainCell } from './GainCells'
import { ExpandBtn } from './ExpandBtn'
import { SortHeader } from './SortHeader'
import { HoverChart, type ChartTarget } from '@/features/hover-charts/HoverChart'
import { HoverSavingsChart, type SavingsChartTarget } from '@/features/hover-charts/HoverSavingsChart'
import { HoverAllocationPopover, type AllocationHoverTarget } from '@/features/allocation-charts/HoverAllocationPopover'
import { useAllocationByIsin } from '@/hooks/useAllocationByIsin'
import { CASH_SUFFIX } from '@/shared/constants/accountCategories'
import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import {
  FundPositionPopover,
  type FundPositionPopoverTarget,
} from '@/features/fund-holdings/FundPositionPopover'
import {
  FUND_QUALITY_LABELS,
  fundQualityCategory,
  fundQualitySourceLabel,
  statusForPosition,
} from '@/features/fund-holdings/fundHoldings.logic'
import { DATA_TABLE_STYLES } from '@/shared/ui/tableStyles'

const col = createColumnHelper<TableRow>()

function irrPeriodLabel(years: number | null): string {
  if (years == null) return '3y'
  if (years >= 3) return '3y'
  if (years >= 1) return `${Math.floor(years * 10) / 10}y`
  return `${Math.max(1, Math.round(years * 12))}mo`
}

interface Props {
  data: PositionRow[]
  groupByType?: boolean
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  expanded?: ExpandedState
  onExpandedChange?: OnChangeFn<ExpandedState>
  fundHoldings?: FundHolding[]
  fundStatuses?: FundHoldingStatus[]
  onOpenCompleteHoldings?: (fundName: string) => void
}

export function PositionsTable({
  data, groupByType = false, sortKey, sortDir, onSort,
  expanded, onExpandedChange,
  fundHoldings = [], fundStatuses = [], onOpenCompleteHoldings,
}: Props) {
  const [chart, setChart] = useState<ChartTarget | null>(null)
  const [savingsChart, setSavingsChart] = useState<SavingsChartTarget | null>(null)
  const [allocationHover, setAllocationHover] = useState<AllocationHoverTarget | null>(null)
  const [underlyingPopover, setUnderlyingPopover] = useState<FundPositionPopoverTarget | null>(null)
  const { data: allocationData } = useAllocationByIsin()
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHide = () => { if (hideTimeout.current) clearTimeout(hideTimeout.current) }
  const scheduleHide = () => {
    hideTimeout.current = setTimeout(() => {
      setChart(null)
      setSavingsChart(null)
      setAllocationHover(null)
      setUnderlyingPopover(null)
    }, 200)
  }

  const groupTotals = useMemo(() => {
    const map = new Map<string, { value: number; unrealized: number; realized: number; totalRealized: number; dividends: number }>()
    for (const row of data) {
      const type = row.account_type ?? ''
      const cur = map.get(type) ?? { value: 0, unrealized: 0, realized: 0, totalRealized: 0, dividends: 0 }
      map.set(type, {
        value: cur.value + (row.total_value ?? 0),
        unrealized: cur.unrealized + (row.unrealized_gain ?? 0),
        realized: cur.realized + row.realized_gain,
        totalRealized: cur.totalRealized + row.total_realized_return,
        dividends: cur.dividends + row.total_dividends + row.total_interest,
      })
    }
    return map
  }, [data])

  const columns = useMemo(() => [
    col.display({
      id: 'expander',
      header: '',
      size: 24,
      cell: ({ row }) => (
        <span style={{ paddingLeft: `${row.depth * 20}px` }} className="flex items-center gap-1">
          <ExpandBtn row={row} />
        </span>
      ),
    }),
    col.display({
      id: 'name',
      header: 'Asset',
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          return (
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="font-medium text-white">{r.name}</span>
                {r.status === 'closed' && (
                  <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">Closed</span>
                )}
              </span>
              {(r.ticker || r.isin) && (
                <span className="flex items-center gap-1.5">
                  {r.isin && <span className="text-xs text-gray-600 font-mono">{r.isin}</span>}
                  {r.isin && r.ticker && <span className="text-gray-700 text-xs">·</span>}
                  {r.ticker && <span className="text-xs text-gray-400 font-mono">{r.ticker}</span>}
                </span>
              )}
            </span>
          )
        }
        if (r.kind === 'group') {
          return <span className="text-sm font-semibold text-gray-300">{r.label}</span>
        }
        if (r.kind === 'operation') {
          return (
            <span className="flex items-center gap-2 text-sm">
              <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                r.operation_type === 'BUY' ? SEMANTIC_BADGE_CLASSES.transactionBuy :
                r.operation_type === 'SELL' ? SEMANTIC_BADGE_CLASSES.transactionSell :
                SEMANTIC_BADGE_CLASSES.transactionOther
              }`}>{r.operation_type}</span>
              <span className="text-gray-400">{r.date}</span>
              <span className="text-gray-500 text-xs">{r.account}</span>
            </span>
          )
        }
        return null
      },
    }),
    col.display({
      id: 'value',
      header: () => <SortHeader label="Current value" tooltip="Market value of the position at the last known price: quantity held × last price. Shows — for closed positions." col="total_value" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          const showQuantity = r.account_category === 'brokerage'
            && !r.account_type?.endsWith(CASH_SUFFIX)
            && r.quantity != null
          return (
            <span className="flex flex-col leading-tight">
              <span className="flex items-center gap-1">
                {r.total_value != null
                  ? <span className="text-white font-medium">{fmt.format(r.total_value)}</span>
                  : <span className="text-gray-500">—</span>}
              </span>
              {showQuantity && (
                <span className="text-[10px] text-gray-500 mt-0.5">
                  {fmtQty.format(r.quantity!)}
                  {r.last_price != null && <> · {fmtDec.format(r.last_price)}</>}
                </span>
              )}
            </span>
          )
        }
        if (r.kind === 'group' && r.total_invested != null) {
          return (
            <span className="text-xs text-gray-400 flex flex-col gap-0.5">
              <span className="underline decoration-dashed decoration-gray-500 underline-offset-2">Invested: {fmt.format(r.total_invested)}</span>
              {r.avg_buy_price != null && (
                <span className="text-gray-500">
                  Avg price: {fmtDec.format(r.avg_buy_price)}
                  <span className="ml-1 opacity-40 text-[9px]">▲</span>
                </span>
              )}
            </span>
          )
        }
        if (r.kind === 'group' && r.label === 'Deposits / Withdrawals') {
          return (
            <span className="text-xs flex flex-col gap-0.5">
              <span className={`${SEMANTIC_TEXT_CLASSES.netContributionsDetail} ${SEMANTIC_TEXT_CLASSES.netContributionsDecoration} underline decoration-dashed underline-offset-2`}>Deposited: {fmt.format(r.deposit_total ?? 0)}</span>
              {(r.withdrawal_total ?? 0) > 0 && (
                <span className={SEMANTIC_TEXT_CLASSES.outflowDetail}>Withdrawn: {fmt.format(r.withdrawal_total ?? 0)}</span>
              )}
            </span>
          )
        }
        if (r.kind === 'operation') {
          return <span className="text-sm text-gray-300">{fmtDec.format(Math.abs(r.total_amount))}</span>
        }
        return null
      },
    }),
    col.display({
      id: 'breakdown',
      header: () => <span title="Position-level allocation and underlying-exposure breakdowns.">Breakdown</span>,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind !== 'position') return null
        const allocKey = r.isin || `NC-${r.name}`
        const allocation = allocationData.get(allocKey)
        const fundStatus = statusForPosition(r, fundStatuses)
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
                aria-label={`View allocations for ${r.name}`}
                title="View asset allocations"
                className="shrink-0 rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-700 hover:text-blue-300 focus-visible:bg-gray-700 focus-visible:text-blue-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
                onMouseEnter={(event) => showAllocation(event.currentTarget)}
                onMouseLeave={scheduleHide}
                onFocus={(event) => showAllocation(event.currentTarget)}
                onBlur={scheduleHide}
                onClick={(event) => {
                  event.stopPropagation()
                  showAllocation(event.currentTarget)
                }}
              >
                <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
                  <circle cx="10" cy="10" r="7.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 2.25A7.75 7.75 0 0 1 17.75 10H10Z" fill="currentColor" />
                  <path d="M10 10 4.52 15.48" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
            {!allocation && <span className="block size-8" aria-hidden="true" />}
            {fundStatus && (
              <UnderlyingStatusButton
                status={fundStatus}
                assetName={r.name}
                isOpen={underlyingPopover?.position.id === r.id}
                onShow={showUnderlying}
                onHide={scheduleHide}
              />
            )}
            {!fundStatus && <span className="block size-8" aria-hidden="true" />}
            {!allocation && !fundStatus && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-700">—</span>}
          </span>
        )
      },
    }),
    col.display({
      id: 'unrealized',
      header: () => <SortHeader label="Unrealized P&L (gross)" tooltip="Gross unrealized gain/loss on the open position. Calculation: current value − cost basis. In small text: estimated tax on disposal at the configured rate (default 30%). Shows 'net' if rate = 0%." col="unrealized_gain" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          return <UnrealizedGainCell r={r} />
        }
        if (r.kind === 'operation' && r.operation_type === 'BUY') {
          return r.quantity != null ? (
            <span className="text-xs text-gray-400">{r.quantity != null ? +r.quantity.toFixed(2) : ''} × {r.price_per_unit != null ? fmtDec.format(r.price_per_unit) : '—'}</span>
          ) : null
        }
        return null
      },
    }),
    col.display({
      id: 'realized',
      header: () => <SortHeader label="Realized P&L (gross)" tooltip="Gross realized gains/losses on disposal. Calculation: sale proceeds − weighted average cost. In small text: estimated tax at the configured rate (default 30%). Shows 'net' if rate = 0%." col="realized_gain" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          return <RealizedGainCell r={r} />
        }
        if (r.kind === 'group' && r.label === 'Buys / Sells') {
          return (
            <span className="text-xs space-x-2">
              <span className="text-gray-400">Sold: {fmt.format(r.total_sold ?? 0)}</span>
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
      header: () => <SortHeader label="Total realized return" tooltip="Cash actually collected: realized gains on disposal + dividends/interest received. Excludes the unrealized value of the still-open position. Calculation: realized P&L + total dividends." col="total_realized_return" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          return r.total_realized_return !== 0 ? (
            <GainCell value={r.total_realized_return} />
          ) : <span className="text-gray-600">—</span>
        }
        return null
      },
    }),
    col.display({
      id: 'dividends',
      header: () => <SortHeader label="Dividends / Interest" tooltip="Dividends received (stocks/ETFs) and interest received (bonds/cash), since the first purchase, across all accounts." col="total_dividends" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind === 'position') {
          const hasDivs = r.total_dividends > 0
          const hasInt = r.total_interest > 0
          if (!hasDivs && !hasInt) return <span className="text-gray-600">—</span>
          const divTax = (hasDivs && r.total_dividends_net != null && r.tax_rate != null && r.tax_rate > 0)
            ? r.total_dividends - r.total_dividends_net : null
          const intTax = (hasInt && r.total_interest_net != null && r.tax_rate != null && r.tax_rate > 0)
            ? r.total_interest - r.total_interest_net : null
          return (
            <span className="flex flex-col leading-tight text-xs">
              <span className="space-x-2">
                {hasDivs && <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>{fmt.format(r.total_dividends)}</span>}
                {hasInt && <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>{fmt.format(r.total_interest)} int.</span>}
              </span>
              {divTax != null && divTax > 0 && (
                <span className="text-[10px] text-gray-500 mt-0.5">
                  ~{fmt.format(-divTax)} tax on div. ({(r.tax_rate! * 100).toFixed(0)}%)
                </span>
              )}
              {intTax != null && intTax > 0 && (
                <span className="text-[10px] text-gray-500 mt-0.5">
                  ~{fmt.format(-intTax)} tax on int. ({(r.tax_rate! * 100).toFixed(0)}%)
                </span>
              )}
              {r.tax_rate === 0 && (hasDivs || hasInt) && (
                <span className="text-[10px] text-gray-500 mt-0.5">net (0% tax)</span>
              )}
            </span>
          )
        }
        if (r.kind === 'group' && r.label === 'Dividends') {
          return (
            <span className="text-xs space-x-2">
              <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>{fmt.format(r.total_dividends ?? 0)}</span>
              <span className="text-gray-400">({r.dividend_count} payments, ~{fmt.format(r.annualized_dividends ?? 0)}/yr)</span>
            </span>
          )
        }
        if (r.kind === 'group' && r.label === 'Interest') {
          return (
            <span className="text-xs space-x-2">
              <span className={SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}>{fmt.format(r.total_interest ?? 0)}</span>
              <span className="text-gray-400">({r.interest_count} payments)</span>
            </span>
          )
        }
        if (r.kind === 'operation' && r.operation_type === 'DIVIDEND') {
          return <span className={`text-sm ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}>{fmtDec.format(r.total_amount)}</span>
        }
        if (r.kind === 'operation' && r.operation_type === 'INTEREST') {
          return <span className={`text-sm ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}>{fmtDec.format(r.total_amount)}</span>
        }
        return null
      },
    }),
    col.display({
      id: 'total_return_pct',
      header: () => <SortHeader label="Total return" tooltip="Gross, non-annualized return across all sources. Calculation: (current value + sales + dividends − purchases) / purchases × 100. Includes the unrealized (open position), the realized (sales) and dividends. Does not account for the timing of cash flows." col="total_return_pct" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind !== 'position' || r.total_return_pct == null) return null
        return (
          <span className={gainClass(r.total_return_pct)}>
            {fmtPct(r.total_return_pct, 2)}
          </span>
        )
      },
    }),
    col.display({
      id: 'xirr',
      header: () => <SortHeader label="Annualized IRR" tooltip="Annualized Internal Rate of Return (XIRR). The main value is calculated since inception. The smaller value measures the trailing three years, using the position value at the start of that window as a fictitious outflow. If less than three years of history are available, it uses and labels the full available period instead. Purchases are outflows; sales, dividends and current value are inflows." col="xirr" activeKey={sortKey} dir={sortDir} onSort={onSort} />,
      cell: ({ row }) => {
        const r = row.original
        if (r.kind !== 'position' || (r.xirr == null && r.xirr_rolling_3y == null)) return null
        return (
          <span className="flex flex-col leading-tight">
            {r.xirr != null && (
              <span className={gainClass(r.xirr)}>
                {fmtPct(r.xirr, 2)}
                <span className="ml-0.5 text-xs opacity-60">/yr</span>
              </span>
            )}
            {r.xirr != null && (
              <span className="mt-0.5 text-[10px] text-gray-500">
                {irrPeriodLabel(r.xirr_rolling_period_years)}:{' '}
                {r.xirr_rolling_3y != null ? `${fmtPct(r.xirr_rolling_3y, 2)}/yr` : '—'}
              </span>
            )}
          </span>
        )
      },
    }),
  ], [setChart, sortKey, sortDir, onSort, allocationData, fundStatuses, underlyingPopover])

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
    state: expanded === undefined ? undefined : { expanded },
    onExpandedChange,
  })

  return (
    <section className={DATA_TABLE_STYLES.panel}>
      <div className={DATA_TABLE_STYLES.toolbar}>
        <div>
          <h2 className={DATA_TABLE_STYLES.title}>All portfolio positions</h2>
          <p className={DATA_TABLE_STYLES.description}>Expand each position to review its transactions and income details.</p>
        </div>
        <div className={DATA_TABLE_STYLES.actions}>
          <button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(true)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-gray-500 hover:text-white sm:flex-none"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(false)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-gray-500 hover:text-white sm:flex-none"
          >
            Collapse all
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full text-sm text-left table-fixed">
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
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {(() => {
              let lastType: string | undefined = undefined
              return table.getRowModel().rows.map((row) => {
                const r = row.original
                const isPosition = r.kind === 'position'
                const isGroup = r.kind === 'group'
                let rootRow: typeof row = row
                while (rootRow.getParentRow()) rootRow = rootRow.getParentRow()!
                const isClosed =
                  rootRow.original.kind === 'position' && rootRow.original.status === 'closed'

                const isTradeGroup = r.kind === 'group' && r.label === 'Buys / Sells'
                const chartHandlers = isTradeGroup ? (() => {
                  const parent = row.getParentRow()?.original
                  if (parent?.kind !== 'position') return null
                  const { name } = parent
                  const posKey = parent.isin || parent.ticker || name
                  if (!posKey) return null
                  const ops = parent.subRows
                    .flatMap(g => g.subRows)
                    .filter(o => o.operation_type === 'BUY' || o.operation_type === 'SELL')
                    .map(o => ({
                      date: o.date,
                      operation_type: o.operation_type,
                      total_amount: o.total_amount,
                      realized_gain: o.realized_gain,
                    }))
                  return {
                    onMouseEnter: (e: React.MouseEvent<HTMLTableCellElement>) => {
                      cancelHide()
                      setSavingsChart(null); setAllocationHover(null); setUnderlyingPopover(null)
                      setChart({ isin: posKey, name, operations: ops, buttonRect: e.currentTarget.getBoundingClientRect() })
                    },
                    onMouseLeave: scheduleHide,
                  }
                })() : null

                const isSavingsGroup = r.kind === 'group' && r.label === 'Deposits / Withdrawals'
                const savingsHandlers = isSavingsGroup ? (() => {
                  const parent = row.getParentRow()?.original
                  if (parent?.kind !== 'position') return null
                  const { name } = parent
                  const ops = parent.subRows
                    .flatMap(g => g.subRows)
                    .filter(o => o.operation_type === 'DEPOSIT' || o.operation_type === 'INTEREST')
                    .map(o => ({ date: o.date, total_amount: o.total_amount, operation_type: o.operation_type }))
                  return {
                    onMouseEnter: (e: React.MouseEvent<HTMLTableCellElement>) => {
                      cancelHide()
                      setChart(null); setAllocationHover(null); setUnderlyingPopover(null)
                      setSavingsChart({ name, operations: ops, buttonRect: e.currentTarget.getBoundingClientRect() })
                    },
                    onMouseLeave: scheduleHide,
                  }
                })() : null

                let separator: React.ReactNode = null
                if (groupByType && isPosition && row.depth === 0) {
                  const currentType = r.account_type ?? ''
                  if (currentType !== lastType) {
                    lastType = currentType
                    const totals = groupTotals.get(currentType)
                    const td = 'px-3 py-1.5 text-xs bg-gray-800 border-t-2 border-gray-600 border-b border-gray-700'
                    separator = (
                      <tr key={`sep-${currentType}`}>
                        <td className={td} />
                        <td className={`${td} font-semibold text-gray-400 uppercase tracking-widest`}>
                          {currentType || 'Other'}
                        </td>
                        <td className={`${td} text-gray-200 font-medium`}>
                          {totals && totals.value > 0 ? fmt.format(totals.value) : ''}
                        </td>
                        <td className={td} />
                        <td className={`${td} ${totals ? gainClass(totals.unrealized) : ''}`}>
                          {totals && totals.unrealized !== 0 ? fmt.format(totals.unrealized) : ''}
                        </td>
                        <td className={`${td} ${totals ? gainClass(totals.realized) : ''}`}>
                          {totals && totals.realized !== 0 ? fmt.format(totals.realized) : ''}
                        </td>
                        <td className={`${td} ${totals ? gainClass(totals.totalRealized) : ''}`}>
                          {totals && totals.totalRealized !== 0 ? fmt.format(totals.totalRealized) : ''}
                        </td>
                        <td className={`${td} ${SEMANTIC_TEXT_CLASSES.passiveIncomeDetail}`}>
                          {totals && totals.dividends !== 0 ? fmt.format(totals.dividends) : ''}
                        </td>
                        <td className={td} />
                        <td className={td} />
                      </tr>
                    )
                  }
                }

                return (
                  <Fragment key={row.id}>
                    {separator}
                    <tr
                      className={[
                        'border-b transition-colors',
                        isClosed ? 'border-gray-900 opacity-40 hover:opacity-70' : 'border-gray-800',
                        isPosition && !isClosed ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer' : '',
                        isPosition && isClosed ? 'bg-gray-950 cursor-pointer' : '',
                        isGroup && !isClosed ? 'bg-gray-850 hover:bg-gray-800 cursor-pointer' : '',
                        isGroup && isClosed ? 'bg-gray-950 cursor-pointer' : '',
                        !isPosition && !isGroup ? 'bg-gray-950' : '',
                      ].join(' ')}
                      onClick={row.getCanExpand() ? row.getToggleExpandedHandler() : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2 overflow-hidden"
                          {...(chartHandlers && cell.column.id === 'value' ? chartHandlers : {})}
                          {...(savingsHandlers && cell.column.id === 'value' ? savingsHandlers : {})}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                )
              })
            })()}
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
          holdings={fundHoldings}
          onOpenComplete={onOpenCompleteHoldings}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}
    </section>
  )
}

function UnderlyingStatusButton({
  status,
  assetName,
  isOpen,
  onShow,
  onHide,
}: {
  status: FundHoldingStatus
  assetName: string
  isOpen: boolean
  onShow: (button: HTMLButtonElement) => void
  onHide: () => void
}) {
  const category = fundQualityCategory(status.qualityTier)
  const label = FUND_QUALITY_LABELS[category]
  const title = `${label} · ${fundQualitySourceLabel(status.qualityTier)} · ${status.explainedPct.toFixed(1)} % expliqué`
  const tone = category === 'reliable'
    ? 'text-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-300 focus-visible:ring-emerald-500'
    : category === 'partial'
      ? 'text-amber-400 hover:bg-amber-950/60 hover:text-amber-300 focus-visible:ring-amber-500'
      : 'text-red-400 hover:bg-red-950/60 hover:text-red-300 focus-visible:ring-red-500'

  return (
    <button
      type="button"
      aria-label={`${title} pour ${assetName}. ${isOpen ? 'Masquer' : 'Afficher'} la composition.`}
      aria-expanded={isOpen}
      title={`${title} · ${isOpen ? 'Masquer' : 'Afficher'} la composition`}
      className={`rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 ${tone} ${isOpen ? 'bg-gray-800 ring-1 ring-current/40' : ''}`}
      onMouseEnter={(event) => onShow(event.currentTarget)}
      onMouseLeave={onHide}
      onFocus={(event) => onShow(event.currentTarget)}
      onBlur={onHide}
      onClick={(event) => {
        event.stopPropagation()
        onShow(event.currentTarget)
      }}
    >
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="7" y="2.25" width="6" height="4" rx="1" />
        <path d="M10 6.25v3.25M4.5 9.5h11M4.5 9.5v2.25M10 9.5v2.25M15.5 9.5v2.25" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2.25" y="11.75" width="4.5" height="4" rx="1" />
        <rect x="7.75" y="11.75" width="4.5" height="4" rx="1" />
        <rect x="13.25" y="11.75" width="4.5" height="4" rx="1" />
      </svg>
    </button>
  )
}
