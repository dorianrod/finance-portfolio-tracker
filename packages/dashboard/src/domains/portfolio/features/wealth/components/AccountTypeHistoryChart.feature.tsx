import { useMemo, useState } from 'react'
import { AreaChart, Legend, ResponsiveContainer, Tooltip } from 'recharts'

import {
  accountTypeShareKey,
  withAccountTypeShares,
} from '@/domains/portfolio/features/wealth/helpers/mappers/buildChartScaleData'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { AccountTypeHistoryTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import {
  type ChartScaleMode,
  ChartScaleToggle,
} from '@/shared/ui/ChartScaleToggle.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

function AccountTypeGradient({
  accountType,
  index,
  typeCategories,
}: {
  accountType: string
  index: number
  typeCategories: Record<string, string>
}) {
  return (
    <SeriesGradient
      id={`grad-${index}`}
      profile="layered"
      group={{ key: accountType, index, categories: typeCategories }}
    />
  )
}

function AccountTypeArea({
  accountType,
  index,
  percentageMode,
  typeCategories,
}: {
  accountType: string
  index: number
  percentageMode: boolean
  typeCategories: Record<string, string>
}) {
  return (
    <SeriesArea
      type="monotone"
      dataKey={percentageMode ? accountTypeShareKey(index) : accountType}
      name={accountType}
      stackId="a"
      group={{ key: accountType, index, categories: typeCategories }}
      gradientId={`grad-${index}`}
      weight="fine"
    />
  )
}

export function AccountTypeHistoryChart({
  data,
  accountTypes,
  typeCategories,
}: {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(
    () => withAccountTypeShares(data, accountTypes),
    [data, accountTypes],
  )

  return (
    <Surface variant="chart" className="flex-1 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Text
          as="h2"
          variant="label"
          tone="muted"
          className="flex items-center"
        >
          {i18n.t('ui.accounttypehistorychart.accountTypeOverTime')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.accounttypehistorychart.evolutionOfPortfolioValueByAccountTypeShownAs',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </Text>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          key={scale}
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {accountTypes.map((accountType, index) => (
              <AccountTypeGradient
                key={accountType}
                accountType={accountType}
                index={index}
                typeCategories={typeCategories}
              />
            ))}
          </defs>
          <ChartGrid />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }

            interval="preserveStartEnd"
          />
          <ChartYAxis
            tickFormatter={
              percentageMode
                ? (value) => `${Math.round(Number(value))}%`
                : (value) => formatMoney(value, { style: 'compact' })
            }
            domain={percentageMode ? [0, 100] : undefined}

            width={percentageMode ? 48 : 52}
          />
          <Tooltip
            content={
              <AccountTypeHistoryTooltip
                accountTypes={accountTypes}
                typeCategories={typeCategories}
                percentageMode={percentageMode}
              />
            }
          />
          <Legend formatter={AccountTypeLegendLabel} />
          {accountTypes.map((accountType, index) => (
            <AccountTypeArea
              key={accountType}
              accountType={accountType}
              index={index}
              percentageMode={percentageMode}
              typeCategories={typeCategories}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function AccountTypeLegendLabel(value: string) {
  return (
    <ChartText tone={'tick'} variant="caption">
      {value}
    </ChartText>
  )
}
