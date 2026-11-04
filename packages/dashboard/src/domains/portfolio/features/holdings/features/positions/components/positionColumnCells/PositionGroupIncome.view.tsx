import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { GroupRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionGroupIncome({ group: r }: { group: GroupRow }) {
  const { formatMoney } = usePositionTableFormatters()
  if (r.groupType === 'dividends') {
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
  if (r.groupType === 'interest') {
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
  return null
}
