import i18n from '@/i18n/i18n'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAtomValue } from 'jotai'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { catColor } from '@/shared/theme/chartColors'
import type { AllocationPoint } from '@/domains/portfolio/types/allocation'
import { formatGroupedAllocationLabel, groupAllocationTail } from './helpers/presenters/groupAllocationTail'
import { PieTooltip } from './allocationCharts.tooltips.view'
import { PieLabel } from './PieLabel.view'
import { PositionsToggle } from './PositionsToggle.view'
import type { AllocationDimension, PieEntry } from './allocationCharts.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import { useDashboardAllocationFilters } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationPositions'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'

interface DonutCardProps {
  title: string
  point: AllocationPoint
  dimension: AllocationDimension
}

interface DonutCellProps {
  activeFilter: ReturnType<typeof useAtomValue<typeof dashboardAllocationFilterAtom>>
  activeSegment: string | null
  entry: PieEntry
}

function DonutCell({ activeFilter, activeSegment, entry }: DonutCellProps) {
  const isActive = activeSegment === entry.name
  const isDimmed = activeFilter !== null && !isActive

  return (
    <Cell
      fill={catColor(entry.name)}
      opacity={isDimmed ? 0.25 : 1}
      stroke={isActive ? CHART_THEME.label : 'none'}
      strokeWidth={isActive ? 2 : 0}
    />
  )
}

export function DonutCard({ title, point, dimension }: DonutCardProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const { toggleFilter } = useDashboardAllocationFilters()
  const { togglePositions } = useDashboardAllocationPositions()
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const dateLabel = formatDate(point.date, { style: 'longMonthYear' })

  const { main, grouped } = groupAllocationTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [{ name: formatGroupedAllocationLabel(grouped.length), value: groupedTotal, total, subItems: grouped }]
      : []),
  ]

  const activeSeg = activeFilter?.type === dimension ? activeFilter.value : null

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-1 flex items-start justify-between gap-3">
        {/* eslint-disable-next-line local/no-prop-drilling -- This feature owns the chart copy and scope passed to the tooltip feature adapter. */}
        <h2 className="flex items-center text-sm font-medium text-gray-400">{title}<ScopedInfoTooltip text={i18n.t('ui.donutcard.portfolioAllocationByValue0AtTheDisplayedSnapshot', { value0: title.toLowerCase() })} scope={{ account: 'filterable', period: 'as-of', effectiveDate: point.date }} /></h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-gray-600">{dateLabel}</span>
          {activeFilter?.type === dimension && <PositionsToggle open={positionsOpen} onClick={togglePositions} />}
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-1">{i18n.t('ui.donutcard.allocated')} {formatMoney(total, { style: 'full' })}</div>
      <div className="text-xs text-gray-600 mb-2">{i18n.t('ui.donutcard.clickASegmentToFilter')}</div>
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
            onClick={(entry: unknown) => {
              if (!(entry as PieEntry).name.startsWith('others (')) {
                toggleFilter({ type: dimension, value: (entry as PieEntry).name })
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry) => (
              <DonutCell key={entry.name} activeFilter={activeFilter} activeSegment={activeSeg} entry={entry} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
