import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { AreaChart, Legend, ResponsiveContainer, Tooltip } from 'recharts'

import { AccountTypeHistoryTooltip } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryTooltip.view'
import { getAccountTypeTone } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/helpers/presenters/getAccountTypeTone'
import { withAccountTypeShares } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/helpers/presenters/withAccountTypeShares'
import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import {
  type ChartScaleMode,
  ChartScaleToggle,
} from '@/shared/ui/ChartScaleToggle.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function AccountTypeHistoryChart({
  data,
  children,
  accountTypes,
  typeCategories,
}: {
  children: ReactNode
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(
    () => withAccountTypeShares(data, accountTypes),
    [data, accountTypes],
  )

  return (
    <div className="flex-1">
      <Surface variant="chart">
        <Inline
          as="div"
          spaceAfter="default"
          align="start"
          justify="between"
          gap="default"
        >
          <Text as="h2" variant="label" tone="muted">
            <Inline as="span" align="center">
              {i18n.t('ui.accounttypehistorychart.accountTypeOverTime')}
              {children}
            </Inline>
          </Text>
          <ChartScaleToggle valueLabel="€" value={scale} onChange={setScale} />
        </Inline>
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
                  ? (value) =>
                      formatPercentage(Math.round(Number(value)), {
                        decimals: 0,
                      })
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
    </div>
  )
}

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
      tone={getAccountTypeTone(accountType, index, typeCategories)}
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
      dataKey={(point: AccountTypeChartPoint) =>
        percentageMode ? point.shares[index] : point.values[accountType]
      }
      name={accountType}
      stackId="a"
      tone={getAccountTypeTone(accountType, index, typeCategories)}
      gradientId={`grad-${index}`}
      weight="fine"
    />
  )
}

function AccountTypeLegendLabel(value: string) {
  return (
    <ChartText tone={'tick'} variant="caption">
      {value}
    </ChartText>
  )
}
