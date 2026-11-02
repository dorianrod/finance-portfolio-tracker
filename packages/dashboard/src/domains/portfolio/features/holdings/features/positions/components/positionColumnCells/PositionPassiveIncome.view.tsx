import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionPassiveIncomeView({
  dividends,
  interest,
  dividendTax,
  interestTax,
  taxRatePercentage,
  taxFree,
}: {
  dividends: number
  interest: number
  dividendTax: number | null
  interestTax: number | null
  taxRatePercentage: number | null
  taxFree: boolean
}) {
  const { formatMoney } = usePositionTableFormatters()
  const hasDivs = dividends > 0
  const hasInt = interest > 0
  const displayedDividendTax =
    dividendTax != null && dividendTax > 0 ? dividendTax : null
  const displayedInterestTax =
    interestTax != null && interestTax > 0 ? interestTax : null
  return (
    <Text variant="compactCaption">
      <Stack as="span">
        <Layout as="span">
          {hasDivs && <Text tone={'decorative'}>{formatMoney(dividends)}</Text>}
          {hasInt && (
            <Text tone={'decorative'}>
              {i18n.t('ui.positionstable.intWithValues', {
                amount: formatMoney(interest),
              })}
            </Text>
          )}
        </Layout>
        <IncomeTaxAnnotations
          dividendTax={displayedDividendTax}
          interestTax={displayedInterestTax}
          taxRatePercentage={taxRatePercentage}
        />
        {taxFree && (
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

function IncomeTaxAnnotations({
  dividendTax: displayedDividendTax,
  interestTax: displayedInterestTax,
  taxRatePercentage,
}: {
  dividendTax: number | null
  interestTax: number | null
  taxRatePercentage: number | null
}) {
  const { formatMoney, formatPercentage } = usePositionTableFormatters()
  return (
    <>
      {displayedDividendTax != null && (
        <Layout as="span" flow="inline" spaceBefore="compact">
          <Text variant="tiny" tone="subtle">
            {i18n.t('ui.positionstable.taxOnDivWithValues', {
              amount: formatMoney(-displayedDividendTax),
              percentage: formatPercentage(taxRatePercentage, {
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
              percentage: formatPercentage(taxRatePercentage, {
                decimals: 0,
              }),
            })}
          </Text>
        </Layout>
      )}
    </>
  )
}
