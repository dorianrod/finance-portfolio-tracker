import { type Row } from '@tanstack/react-table'

import { isTaxFreePassiveIncome } from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/positionDisplayRules/isTaxFreePassiveIncome'
import { calculatePassiveIncomeTax } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues/calculatePassiveIncomeTax'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

// eslint-disable-next-line complexity -- Position, payment-group and operation variants implement the same income column contract.
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

// eslint-disable-next-line complexity -- Dividend and interest visibility share one passive-income cell; tax calculations already have dedicated helpers.
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
