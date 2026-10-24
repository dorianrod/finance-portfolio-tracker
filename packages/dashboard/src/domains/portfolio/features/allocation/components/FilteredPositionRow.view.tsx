import type { MatchingIsinRow } from '@/domains/portfolio/shared/types/allocationChart.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function FilteredPositionRow({
  color,
  index,
  row,
}: {
  color: string
  index: number
  row: MatchingIsinRow
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const percentage =
    row.totalValue > 0 ? (row.filteredValue / row.totalValue) * 100 : 0
  return (
    <tr
      className={`border-b border-border/50 ${index % 2 === 0 ? '' : 'bg-surface-raised/20'}`}
    >
      <td className="px-4 py-2.5">
        <div className="max-w-[180px] truncate text-xs font-medium leading-tight text-content-secondary">
          {row.name}
        </div>
        <div className="text-[11px] text-content-subtle">{row.isin}</div>
      </td>
      <td className="px-4 py-2.5 text-right text-xs tabular-nums text-content-muted">
        {formatMoney(row.totalValue, { style: 'full' })}
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="text-xs font-medium tabular-nums text-content-secondary">
          {formatMoney(row.filteredValue, { style: 'full' })}
        </div>
        <div className="mt-0.5 flex items-center justify-end gap-1.5">
          <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background: color,
              }}
            />
          </div>
          <span className="w-8 text-right text-[11px] tabular-nums text-content-subtle">
            {formatPercentage(percentage, { decimals: 0 })}
          </span>
        </div>
      </td>
    </tr>
  )
}
