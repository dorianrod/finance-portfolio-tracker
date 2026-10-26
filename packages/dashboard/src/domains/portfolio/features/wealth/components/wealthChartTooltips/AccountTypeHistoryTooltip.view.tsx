import { getAccountTypeTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAccountTypeTone'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function AccountTypeHistoryTooltip({
  active,
  payload,
  label,
  accountTypes,
  typeCategories,
  percentageMode = false,
}: AccountTypeHistoryTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const total = accountTypes.reduce((sum, accountType) => {
    const value = row?.[accountType]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {accountTypes.map((accountType, index) => (
        <AccountTypeTooltipRow
          key={accountType}
          accountType={accountType}
          index={index}
          percentageMode={percentageMode}
          row={row}
          total={total}
          typeCategories={typeCategories}
        />
      ))}
    </TooltipBox>
  )
}

type AccountTypeHistoryTooltipProps = NumericTooltipProps<
  Record<string, number | string | Date>,
  Date | string | number
> & {
  accountTypes: string[]
  percentageMode?: boolean
  typeCategories: Record<string, string>
}

function AccountTypeTooltipRow({
  accountType,
  index,
  percentageMode,
  row,
  total,
  typeCategories,
}: {
  accountType: string
  index: number
  percentageMode: boolean
  row: Record<string, number | string | Date> | undefined
  total: number
  typeCategories: Record<string, string>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const rawValue = row?.[accountType]
  const value = typeof rawValue === 'number' ? rawValue : 0
  if (!value) return null
  const share = total > 0 ? formatPercentage((value / total) * 100) : '—'
  return (
    <ChartText
      as="div"
      tone={getAccountTypeTone(accountType, index, typeCategories)}
    >
      {accountType}: {formatMoney(value, { style: 'full' })}
      {percentageMode && ` · ${share}`}
    </ChartText>
  )
}
