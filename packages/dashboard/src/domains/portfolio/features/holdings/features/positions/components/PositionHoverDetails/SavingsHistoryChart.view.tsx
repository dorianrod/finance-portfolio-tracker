import { AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartXAxis } from '@/shared/ui/ChartAxes.view'
import { ChartGrid } from '@/shared/ui/ChartAxes.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'

import { SavingsTooltip } from './hoverCharts.tooltips.view'

export function SavingsHistoryChart({
  chartData,
}: {
  chartData: { month: string; balance: number; delta: number }[]
}) {
  const formatMoney = useFormatMoney()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
      >
        <defs>
          <SeriesGradient
            id="gSavings"
            profile="medium"
            tone="portfolioValue"
          />
        </defs>
        <ChartGrid />
        <ChartXAxis density="compact" axis dataKey="month" />
        <ChartYAxis
          density="compact"
          tickFormatter={(value) => formatMoney(value)}
          width={64}
        />
        <Tooltip content={<SavingsTooltip />} />
        <SeriesArea
          type="monotone"
          dataKey="balance"
          tone="portfolioValue"
          gradientId="gSavings"
          weight="regular"
          markers="hidden"
          hover="default"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
