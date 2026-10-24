import type { ReactNode } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { catColor } from '@/shared/theme/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'

import { PieLabel } from './PieLabel.view'

export function DonutCardView({
  title,
  date,
  total,
  data,
  activeCategory,
  isFiltered,
  positionsControl,
  tooltip,
  onSelect,
}: {
  title: string
  date: Date
  total: number
  data: PieEntry[]
  activeCategory: string | null
  isFiltered: boolean
  positionsControl: ReactNode
  tooltip: ReactNode
  onSelect: (entry: PieEntry | undefined) => void
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const dateLabel = formatDate(date, { style: 'longMonthYear' })
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-content-muted">
          {title}
          {tooltip}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-content-subtle">{dateLabel}</span>
          {positionsControl}
        </div>
      </div>
      <div className="text-xs text-content-subtle mb-1">
        {i18n.t('ui.donutcard.allocated')}{' '}
        {formatMoney(total, { style: 'full' })}
      </div>
      <div className="text-xs text-content-subtle mb-2">
        {i18n.t('ui.donutcard.clickASegmentToFilter')}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="32%"
            outerRadius="50%"
            paddingAngle={1}
            label={PieLabel}
            labelLine={{ stroke: CHART_THEME.zeroLine, strokeWidth: 1 }}
            onClick={(_entry, index) => onSelect(data[index])}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={catColor(entry.name)}
                opacity={isFiltered && activeCategory !== entry.name ? 0.25 : 1}
                stroke={
                  activeCategory === entry.name ? CHART_THEME.label : 'none'
                }
                strokeWidth={activeCategory === entry.name ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
