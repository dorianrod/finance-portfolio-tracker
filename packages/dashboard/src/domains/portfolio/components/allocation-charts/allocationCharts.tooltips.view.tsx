import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { catColor } from '@/shared/theme/chartColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { tooltipValue, type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import type { PieEntry } from './allocationCharts.types'

export function PieTooltip({ active, payload }: NumericTooltipProps<PieEntry>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null
  const percentage = formatPercentage(item.total > 0 ? (item.value / item.total) * 100 : 0)
  return (
    <TooltipBox minWidth={160}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 4, fontWeight: 600 }}>{item.name}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 700 }}>{formatMoney(item.value, { style: 'full' })}</div>
      <div style={{ color: 'var(--tooltip-dim)', marginBottom: item.subItems?.length ? 6 : 0 }}>
        {percentage} of total allocated
      </div>
      {item.subItems?.map((sub) => {
        const subPercentage = formatPercentage(item.total > 0 ? (sub.value / item.total) * 100 : 0)
        return (
          <div key={sub.name} style={{ color: 'var(--tooltip-dim)', marginTop: 2 }}>
            {sub.name} — {formatMoney(sub.value, { style: 'compact' })} · {subPercentage}
          </div>
        )
      })}
    </TooltipBox>
  )
}

interface EvolutionTooltipProps extends NumericTooltipProps<Record<string, number | string>> {
  categories: string[]
}

export function EvolutionTooltip({ active, payload, label, categories }: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  return (
    <TooltipBox maxWidth={220}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {formatDate(String(label), { style: 'longMonthYear' })}
      </div>
      {categories.toReversed().map((cat) => {
        const val = tooltipValue(payload, cat)
        if (!val) return null
        return (
          <div key={cat} style={{ color: catColor(cat) }}>
            {cat}: {formatPercentage(val)}
          </div>
        )
      })}
    </TooltipBox>
  )
}
