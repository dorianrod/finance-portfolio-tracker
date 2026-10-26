import { type Row } from '@tanstack/react-table'

import { isTaxFreePassiveIncome } from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/positionDisplayRules'
import {
  calculatePassiveIncomeTax,
  shouldShowPositionQuantity,
} from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues'
import { formatIrrPeriodLabel } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/formatIrrPeriodLabel'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainTone'
import type {} from '@/domains/portfolio/features/holdings/features/positions/types/positionColumnContext.type'
import { statusForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'
import { PieChartIcon } from '@/shared/ui/Icons.view'
import { Grid, Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { TreeIndent } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { ExpandBtn } from './ExpandBtn.view'
import { GainCell } from './GainCell.view'
import { RealizedGainCell, UnrealizedGainCell } from './GainCells.feature'
import { TransactionBadge } from './PositionTableAppearance.view'
import { UnderlyingStatusControl } from './UnderlyingStatusControl.feature'

export function PositionExpanderCell({ row }: { row: Row<TableRow> }) {
  return (
    <TreeIndent depth={row.depth}>
      <ExpandBtn row={row} />
    </TreeIndent>
  )
}

export function PositionNameCell({ row }: { row: Row<TableRow> }) {
  const { formatDate } = usePositionTableFormatters()

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
          <Text tone="muted">{formatDate(r.date, { style: 'isoDate' })}</Text>
          <Text variant="caption" tone="subtle">
            {r.account}
          </Text>
        </Inline>
      </Text>
    )
  }
  return null
}

export function PositionValueCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney, formatNumber } = usePositionTableFormatters()

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
                  <> · {formatMoney(r.last_price, { style: 'decimal' })}</>
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
          <Text variant="accentAnnotation" tone="accent">
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
}

export function PositionBreakdownCell({
  row,
  table,
}: import('@tanstack/react-table').CellContext<TableRow, unknown>) {
  const context = table.options.meta?.positionColumns
  if (!context) return null
  const {
    allocationData,
    fundStatuses,
    cancelHide,
    scheduleHide,
    setAllocationHover,
    setChart,
    setSavingsChart,
    setUnderlyingPopover,
  } = context
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
            label={i18n.t('ui.positionstable.viewAllocationsForValue0', {
              value0: r.name,
            })}
            title={i18n.t('ui.positionstable.viewAssetAllocations')}
            variant="subtlePreview"
            onPreview={showAllocation}
            onDismiss={scheduleHide}
          >
            <PieChartIcon />
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
}

export function PositionUnrealizedCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney, formatNumber } = usePositionTableFormatters()

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
}

export function PositionRealizedCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney } = usePositionTableFormatters()

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
}

export function PositionTotalRealizedCell({ row }: { row: Row<TableRow> }) {
  const r = row.original
  if (r.kind === 'position') {
    return r.total_realized_return === 0 ? (
      <Text tone="subtle">—</Text>
    ) : (
      <GainCell value={r.total_realized_return} />
    )
  }
  return null
}

export function PositionIncomeCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') return <PositionPassiveIncome position={r} />
  if (r.kind === 'group' && r.groupType === 'dividends') {
    return (
      <Text variant="caption">
        <Layout as="span" flow="inline">
          <Text tone={'decorative'}>
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
          <Text tone={'decorative'}>
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
      <Text variant="body" tone={'decorative'}>
        {formatMoney(r.total_amount, { style: 'decimal' })}
      </Text>
    )
  }
  if (r.kind === 'operation' && r.operation_type === 'INTEREST') {
    return (
      <Text variant="body" tone={'decorative'}>
        {formatMoney(r.total_amount, { style: 'decimal' })}
      </Text>
    )
  }
  return null
}

export function PositionReturnCell({ row }: { row: Row<TableRow> }) {
  const { formatPercentage } = usePositionTableFormatters()

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
}

export function PositionIrrCell({ row }: { row: Row<TableRow> }) {
  const { formatPercentage } = usePositionTableFormatters()

  const r = row.original
  if (r.kind !== 'position' || (r.xirr == null && r.xirr_rolling_3y == null))
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
}

function PositionPassiveIncome({ position: r }: { position: PositionRow }) {
  const { formatMoney, formatPercentage } = usePositionTableFormatters()

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
  const displayedDividendTax = divTax != null && divTax > 0 ? divTax : null
  const displayedInterestTax = intTax != null && intTax > 0 ? intTax : null
  return (
    <Text variant="compactCaption">
      <Stack as="span">
        <Layout as="span">
          {hasDivs && (
            <Text tone={'decorative'}>{formatMoney(r.total_dividends)}</Text>
          )}
          {hasInt && (
            <Text tone={'decorative'}>
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
