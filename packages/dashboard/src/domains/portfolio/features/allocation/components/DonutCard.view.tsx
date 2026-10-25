import type { ReactNode } from 'react'
import {
  Pie,
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { catColor } from '@/shared/theme/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

import { PieLabel } from './PieLabel/PieLabel.view'

export function DonutCardView({
  title,
  date,
  total,
  data,
  activeCategory,
  isFiltered,
  onSelect,
  children,
}: {
  children: ReactNode
  title: string
  date: Date
  total: number
  data: PieEntry[]
  activeCategory: string | null
  isFiltered: boolean
  onSelect: (entry: PieEntry | undefined) => void
}) {
  const { slot: tooltip, content: remainingChildren } = partitionSlot(
    children,
    DonutCardViewTooltip,
  )
  const { slot: positionsControl } = partitionSlot(
    remainingChildren,
    DonutCardViewPositionsControl,
  )
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
        {i18n.t('ui.donutcard.allocatedWithValues', {
          amount: formatMoney(total, { style: 'full' }),
        })}
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
            shape={(
              shapeProps: ChartShapeProps<PieSectorShapeProps, PieEntry>,
            ) => {
              const entry = shapeProps.payload
              if (!entry) return null
              return (
                <Sector
                  {...shapeProps}
                  fill={catColor(entry.name)}
                  opacity={
                    isFiltered && activeCategory !== entry.name ? 0.25 : 1
                  }
                  stroke={
                    activeCategory === entry.name ? CHART_THEME.label : 'none'
                  }
                  strokeWidth={activeCategory === entry.name ? 2 : 0}
                />
              )
            }}
          />
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function DonutCardViewTooltip({ children }: { children: ReactNode }) {
  return children
}

DonutCardView.Tooltip = DonutCardViewTooltip

function DonutCardViewPositionsControl({ children }: { children: ReactNode }) {
  return children
}

DonutCardView.PositionsControl = DonutCardViewPositionsControl
