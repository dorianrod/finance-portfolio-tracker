import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment, useMemo } from 'react'

import { FundPositionPopover } from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover.feature'
import { HoverChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import { HoverSavingsChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
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
import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainTone'
import { usePositionTableData } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableData'
import { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays'
import { usePositionTableState } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableState'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import { HoverAllocationPopover } from '@/domains/portfolio/shared/components/HoverAllocationPopover.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { statusForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import type { AllocationHoverTarget } from '@/domains/portfolio/shared/types/allocationHoverTarget.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Decorative } from '@/shared/ui/Controls.view'
import { Button } from '@/shared/ui/Controls.view'
import { TableColumn } from '@/shared/ui/DataTable.view'
import { DataCell } from '@/shared/ui/DataTable.view'
import { AllocationIcon } from '@/shared/ui/Icons.view'
import { Grid, Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import {
  PositionRowSurface,
  TransactionBadge,
} from '@/shared/ui/PositionTable.view'
import { Preview } from '@/shared/ui/Preview.view'
import { TreeIndent } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'

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
  let rowKind: 'position' | 'group' | 'detail' = 'detail'
  if (isPosition) rowKind = 'position'
  else if (isGroup) rowKind = 'group'
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
          onPreview: (anchor) => {
            cancelHide()
            setSavingsChart(null)
            setAllocationHover(null)
            setUnderlyingPopover(null)
            setChart({
              isin: positionKey,
              name,
              operations: getPositionTradeOperations(parent),
              buttonRect: anchor.getBoundingClientRect(),
            })
          },
          onDismiss: scheduleHide,
        }
    }
  }
  const isSavingsGroup = item.kind === 'group' && item.groupType === 'cash'
  let savingsHandlers: CellHandlers = null
  if (isSavingsGroup) {
    const parent = row.getParentRow()?.original
    if (parent?.kind === 'position')
      savingsHandlers = {
        onPreview: (anchor) => {
          cancelHide()
          setChart(null)
          setAllocationHover(null)
          setUnderlyingPopover(null)
          setSavingsChart({
            name: parent.name,
            operations: getPositionSavingsOperations(parent),
            buttonRect: anchor.getBoundingClientRect(),
          })
        },
        onDismiss: scheduleHide,
      }
  }
  return (
    <Fragment>
      {separatorType !== undefined && (
        <tr>
          <DataCell variant="group" />
          <DataCell variant="groupLabel">
            {separatorType || i18n.t('ui.positionstable.other')}
          </DataCell>
          <DataCell variant="groupValue">
            {totals && totals.value > 0 ? formatMoney(totals.value) : ''}
          </DataCell>
          <DataCell variant="group" />
          <DataCell
            variant="group"
            tone={totals ? getGainTone(totals.unrealized) : undefined}
          >
            {formatMoney(totals?.unrealized, {
              fallback: '',
              zeroAsFallback: true,
            })}
          </DataCell>
          <DataCell
            variant="group"
            tone={totals ? getGainTone(totals.realized) : undefined}
          >
            {formatMoney(totals?.realized, {
              fallback: '',
              zeroAsFallback: true,
            })}
          </DataCell>
          <DataCell
            variant="group"
            tone={totals ? getGainTone(totals.totalRealized) : undefined}
          >
            {formatMoney(totals?.totalRealized, {
              fallback: '',
              zeroAsFallback: true,
            })}
          </DataCell>
          <DataCell variant="group" tone="income">
            {formatMoney(totals?.dividends, {
              fallback: '',
              zeroAsFallback: true,
            })}
          </DataCell>
          <DataCell variant="group" />
          <DataCell variant="group" />
        </tr>
      )}
      <PositionRowSurface
        kind={rowKind}
        closed={isClosed}
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
      </PositionRowSurface>
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
    dismiss,
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
          <TreeIndent depth={row.depth}>
            <ExpandBtn row={row} />
          </TreeIndent>
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
              <Stack as="span" gap="compact">
                <Inline as="span" align="center" gap="default">
                  <Text variant="medium" tone="default">
                    {r.name}
                  </Text>
                  {r.status === 'closed' && (
                    <Surface as="span" variant="highlightedChip" tone="muted">
                      {i18n.t('ui.positionstable.closed')}
                    </Surface>
                  )}
                </Inline>
                {hasIdentifier && (
                  <Inline as="span" align="center" gap="compact">
                    {r.isin && (
                      <Text variant="captionCode" tone="subtle">
                        {r.isin}
                      </Text>
                    )}
                    {showIdentifierSeparator && (
                      <Text variant="caption" tone="subtle">
                        ·
                      </Text>
                    )}
                    {r.ticker && (
                      <Text variant="captionCode" tone="muted">
                        {r.ticker}
                      </Text>
                    )}
                  </Inline>
                )}
              </Stack>
            )
          }
          if (r.kind === 'group') {
            return (
              <Text variant="bodyStrong" tone="secondary">
                {r.label}
              </Text>
            )
          }
          if (r.kind === 'operation') {
            let operationKind: 'buy' | 'sell' | 'other' = 'other'
            if (r.operation_type === 'BUY') operationKind = 'buy'
            else if (r.operation_type === 'SELL') operationKind = 'sell'
            return (
              <Text variant="body">
                <Inline as="span" align="center" gap="default">
                  <TransactionBadge kind={operationKind}>
                    {r.operation_type}
                  </TransactionBadge>
                  <Text tone="muted">
                    {formatDate(r.date, { style: 'isoDate' })}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {r.account}
                  </Text>
                </Inline>
              </Text>
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
              <Text variant="compact">
                <Stack as="span">
                  <Inline as="span" align="center" gap="compact">
                    {r.total_value == null ? (
                      <Text tone="subtle">—</Text>
                    ) : (
                      <Text variant="medium" tone="default">
                        {formatMoney(r.total_value)}
                      </Text>
                    )}
                  </Inline>
                  {showQuantity && (
                    <Layout as="span" flow="inline" spaceBefore="compact">
                      <Text variant="tiny" tone="subtle">
                        {formatNumber(r.quantity!, {
                          maximumFractionDigits: 0,
                        })}
                        {r.last_price != null && (
                          <>
                            {' '}
                            · {formatMoney(r.last_price, { style: 'decimal' })}
                          </>
                        )}
                      </Text>
                    </Layout>
                  )}
                </Stack>
              </Text>
            )
          }
          if (r.kind === 'group' && r.total_invested != null) {
            return (
              <Text variant="caption" tone="muted">
                <Stack as="span" gap="compact">
                  <Text variant="annotation">
                    {i18n.t('ui.positionstable.investedWithValues', {
                      amount: formatMoney(r.total_invested),
                    })}
                  </Text>
                  {r.avg_buy_price != null && (
                    <Text tone="subtle">
                      {i18n.t('ui.positionstable.avgPriceWithValues', {
                        amount: formatMoney(r.avg_buy_price, {
                          style: 'decimal',
                        }),
                      })}
                      <Layout as="span" flow="inline">
                        <Text variant="quietFine">▲</Text>
                      </Layout>
                    </Text>
                  )}
                </Stack>
              </Text>
            )
          }
          if (r.kind === 'group' && r.groupType === 'cash') {
            return (
              <Text variant="caption">
                <Stack as="span" gap="compact">
                  <Text variant="contributionAnnotation" tone="accent">
                    {i18n.t('ui.positionstable.depositedWithValues', {
                      amount: formatMoney(r.deposit_total, { fallback: 0 }),
                    })}
                  </Text>
                  {(r.withdrawal_total ?? 0) > 0 && (
                    <Text tone="negative">
                      {i18n.t('ui.positionstable.withdrawnWithValues', {
                        amount: formatMoney(r.withdrawal_total, {
                          fallback: 0,
                        }),
                      })}
                    </Text>
                  )}
                </Stack>
              </Text>
            )
          }
          if (r.kind === 'operation') {
            return (
              <Text variant="body" tone="secondary">
                {formatMoney(Math.abs(r.total_amount), { style: 'decimal' })}
              </Text>
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
            <Grid as="span" columns={2} placement="inset" gap="compact">
              {allocation && (
                <Layout as="span" flow="control" sizing="fixed">
                  <Preview.Trigger
                    type="button"
                    label={i18n.t(
                      'ui.positionstable.viewAllocationsForValue0',
                      {
                        value0: r.name,
                      },
                    )}
                    title={i18n.t('ui.positionstable.viewAssetAllocations')}
                    variant="allocationPreview"
                    onPreview={showAllocation}
                    onDismiss={scheduleHide}
                  >
                    <AllocationIcon />
                  </Preview.Trigger>
                </Layout>
              )}
              {!allocation && (
                <Layout as="span" flow="inline" width="icon" height="icon">
                  <Decorative>
                    <Layout as="span" flow="block"></Layout>
                  </Decorative>
                </Layout>
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
                <Layout as="span" flow="inline" width="icon" height="icon">
                  <Decorative>
                    <Layout as="span" flow="block"></Layout>
                  </Decorative>
                </Layout>
              )}
              {hasNoBreakdown && (
                <Layout as="span" flow="block" placement="overlay">
                  <Surface variant="overlay" as="span" tone="subtle">
                    <Inline as="span" align="center" justify="center">
                      —
                    </Inline>
                  </Surface>
                </Layout>
              )}
            </Grid>
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
              <Text variant="caption" tone="muted">
                {formatNumber(r.quantity, { maximumFractionDigits: 2 })} ×{' '}
                {formatMoney(r.price_per_unit, { style: 'decimal' })}
              </Text>
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
              <Text variant="caption">
                <Layout as="span" flow="inline">
                  <Text tone="muted">
                    {i18n.t('ui.positionstable.soldWithValues', {
                      amount: formatMoney(r.total_sold, { fallback: 0 }),
                    })}
                  </Text>
                  <GainCell value={r.realized_pnl ?? null} />
                </Layout>
              </Text>
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
              <Text tone="subtle">—</Text>
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
            if (!hasDivs && !hasInt) return <Text tone="subtle">—</Text>
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
              <Text variant="compactCaption">
                <Stack as="span">
                  <Layout as="span">
                    {hasDivs && (
                      <Text tone="income">
                        {formatMoney(r.total_dividends)}
                      </Text>
                    )}
                    {hasInt && (
                      <Text tone="income">
                        {i18n.t('ui.positionstable.intWithValues', {
                          amount: formatMoney(r.total_interest),
                        })}
                      </Text>
                    )}
                  </Layout>
                  {displayedDividendTax != null && (
                    <Layout as="span" flow="inline" spaceBefore="compact">
                      <Text variant="tiny" tone="subtle">
                        {i18n.t('ui.positionstable.taxOnDivWithValues', {
                          amount: formatMoney(-displayedDividendTax),
                          percentage: formatPercentage(r.tax_rate! * 100, {
                            decimals: 0,
                          }),
                        })}
                      </Text>
                    </Layout>
                  )}
                  {displayedInterestTax != null && (
                    <Layout as="span" flow="inline" spaceBefore="compact">
                      <Text variant="tiny" tone="subtle">
                        {i18n.t('ui.positionstable.taxOnIntWithValues', {
                          amount: formatMoney(-displayedInterestTax),
                          percentage: formatPercentage(r.tax_rate! * 100, {
                            decimals: 0,
                          }),
                        })}
                      </Text>
                    </Layout>
                  )}
                  {isTaxFreePassiveIncome(r) && (
                    <Layout as="span" flow="inline" spaceBefore="compact">
                      <Text variant="tiny" tone="subtle">
                        {i18n.t('ui.positionstable.net0Tax')}
                      </Text>
                    </Layout>
                  )}
                </Stack>
              </Text>
            )
          }
          if (r.kind === 'group' && r.groupType === 'dividends') {
            return (
              <Text variant="caption">
                <Layout as="span" flow="inline">
                  <Text tone="income">
                    {formatMoney(r.total_dividends, { fallback: 0 })}
                  </Text>
                  <Text tone="muted">
                    {i18n.t('ui.positionstable.dividendPayments', {
                      count: r.dividend_count ?? 0,
                      annualAmount: formatMoney(r.annualized_dividends, {
                        fallback: 0,
                      }),
                    })}
                  </Text>
                </Layout>
              </Text>
            )
          }
          if (r.kind === 'group' && r.groupType === 'interest') {
            return (
              <Text variant="caption">
                <Layout as="span" flow="inline">
                  <Text tone="income">
                    {formatMoney(r.total_interest, { fallback: 0 })}
                  </Text>
                  <Text tone="muted">
                    {i18n.t('ui.positionstable.interestPayments', {
                      count: r.interest_count ?? 0,
                    })}
                  </Text>
                </Layout>
              </Text>
            )
          }
          if (r.kind === 'operation' && r.operation_type === 'DIVIDEND') {
            return (
              <Text variant="body" tone="income">
                {formatMoney(r.total_amount, { style: 'decimal' })}
              </Text>
            )
          }
          if (r.kind === 'operation' && r.operation_type === 'INTEREST') {
            return (
              <Text variant="body" tone="income">
                {formatMoney(r.total_amount, { style: 'decimal' })}
              </Text>
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
            <Text tone={getGainTone(r.total_return_pct)}>
              {formatPercentage(r.total_return_pct, {
                decimals: 2,
                signed: true,
              })}
            </Text>
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
            <Text variant="compact">
              <Stack as="span">
                {r.xirr != null && (
                  <Text tone={getGainTone(r.xirr)}>
                    {formatPercentage(r.xirr, { decimals: 2, signed: true })}
                    <Layout as="span" flow="inline">
                      <Text variant="subduedCaption">
                        {i18n.t('ui.positionstable.yr.22ed45')}
                      </Text>
                    </Layout>
                  </Text>
                )}
                {r.xirr != null && (
                  <Layout as="span" flow="inline" spaceBefore="compact">
                    <Text variant="tiny" tone="subtle">
                      {formatIrrPeriodLabel(r.xirr_rolling_period_years)}:{' '}
                      {r.xirr_rolling_3y == null
                        ? '—'
                        : i18n.t('ui.positionstable.value0Yr', {
                            value0: formatPercentage(r.xirr_rolling_3y, {
                              decimals: 2,
                              signed: true,
                            }),
                          })}
                    </Text>
                  </Layout>
                )}
              </Stack>
            </Text>
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
    <Preview
      onKeepOpen={cancelHide}
      open={Boolean(
        chart || savingsChart || allocationHover || underlyingPopover,
      )}
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <TablePanel>
        <TablePanel.Toolbar>
          <div>
            <TablePanel.Title>
              <Inline as="span" align="center">
                {i18n.t('ui.positionstable.allPortfolioPositions')}
                <ScopedInfoTooltip
                  text={i18n.t(
                    'ui.positionstable.positionsAreValuedAtPeriodEndExpandedTransactionAnd',
                  )}
                  scope={{ account: 'filterable', period: 'as-of' }}
                />
              </Inline>
            </TablePanel.Title>
            <TablePanel.Description>
              {i18n.t(
                'ui.positionstable.expandEachPositionToReviewItsTransactionsAndIncome',
              )}
            </TablePanel.Description>
            <Layout spaceBefore="compact">
              <Text as="p" variant="tiny" tone="subtle">
                {i18n.t(
                  'ui.positionstable.transactionAndIncomeAmountsUseTheSelectedPeriod',
                )}
              </Text>
            </Layout>
          </div>
          <TablePanel.Actions>
            <Layout as="span" flow="control" sizing="flexible">
              <Button
                type="button"
                onClick={() => table.toggleAllRowsExpanded(true)}
                variant="tableExpand"
              >
                {i18n.t('ui.positionstable.expandAll')}
              </Button>
            </Layout>
            <Layout as="span" flow="control" sizing="flexible">
              <Button
                type="button"
                onClick={() => table.toggleAllRowsExpanded(false)}
                variant="tableExpand"
              >
                {i18n.t('ui.positionstable.collapseAll')}
              </Button>
            </Layout>
          </TablePanel.Actions>
        </TablePanel.Toolbar>
        <Layout overflow="auto">
          <Surface variant="tableBottom">
            <Layout>
              <Surface variant="bodyFixedTable" as="table" align="left">
                <colgroup>
                  <TableColumn kind="expander" />
                  <TableColumn kind="label" />
                  <TableColumn kind="value" />
                  <TableColumn kind="compact" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                </colgroup>
                <TablePanel.Header>
                  {table.getHeaderGroups().map((group) => (
                    <PositionHeaderRow key={group.id} group={group} />
                  ))}
                </TablePanel.Header>
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
              </Surface>
            </Layout>
          </Surface>
        </Layout>

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
      </TablePanel>
    </Preview>
  )
}
