import type {
  DriverRow,
  OverviewConcentrationRowData,
} from '@/domains/portfolio/features/overview/types/overviewChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function ValueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { timestamp: number; value: number; window: 'previous' | 'current' } }>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <TooltipBox minWidth={190}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        {formatDate(point.timestamp, { style: 'dayMonthYear', timeZone: 'UTC' })}
      </div>
      <div className="mt-1 tabular-nums" style={{ color: 'var(--tooltip-label)' }}>
        {formatMoney(point.value)}
      </div>
      <div className="mt-1 text-xs capitalize" style={{ color: 'var(--tooltip-dim)' }}>
        {point.window} {i18n.t('ui.overviewcharts.period')}
      </div>
    </TooltipBox>
  )
}

export function DriversTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number | null; payload: DriverRow }>
}) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <TooltipBox minWidth={205}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        {row.label}
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between gap-6" style={{ color: 'var(--tooltip-dim)' }}>
          <span>{i18n.t('ui.overviewcharts.current')}</span>
          <span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>
            {row.current == null
              ? i18n.t('ui.overviewcharts.unavailable')
              : formatMoney(row.current)}
          </span>
        </div>
        <div className="flex justify-between gap-6" style={{ color: 'var(--tooltip-dim)' }}>
          <span>{i18n.t('ui.overviewcharts.previous')}</span>
          <span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>
            {row.previous == null
              ? i18n.t('ui.overviewcharts.unavailable')
              : formatMoney(row.previous)}
          </span>
        </div>
        <div
          className="flex justify-between gap-6 border-t pt-1"
          style={{ color: 'var(--tooltip-dim)', borderColor: 'var(--tooltip-border)' }}
        >
          <span>{i18n.t('ui.overviewcharts.difference')}</span>
          <span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>
            {row.current == null || row.previous == null
              ? i18n.t('ui.overviewcharts.unavailable')
              : `${row.current - row.previous > 0 ? '+' : ''}${formatMoney(row.current - row.previous)}`}
          </span>
        </div>
      </div>
    </TooltipBox>
  )
}

export function OverviewConcentrationRow({
  previousAvailable,
  row,
  scaleMax,
}: {
  previousAvailable: boolean
  row: OverviewConcentrationRowData
  scaleMax: number
}) {
  const formatPercentage = useFormatPercentage()
  const delta = row.previousWeight == null ? null : row.weight - row.previousWeight
  let deltaTone = 'text-content-subtle'
  if (delta != null && delta > 0) deltaTone = 'text-danger'
  else if (delta != null && delta < 0) deltaTone = 'text-positive'
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-3 text-xs">
        <span
          className="min-w-0 flex-1 truncate font-medium text-content-secondary"
          title={row.name}
        >
          {row.label}
        </span>
        <span className="shrink-0 tabular-nums text-content-secondary">
          {formatPercentage(row.weight)}
        </span>
        <span
          className={`w-14 shrink-0 text-right text-[10px] font-medium tabular-nums ${deltaTone}`}
        >
          {delta == null ? '—' : formatPercentage(delta, { signed: true, unit: ' pp' })}
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-raised">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-risk/80"
          style={{ width: `${(row.weight / scaleMax) * 100}%` }}
        />
        {previousAvailable && (
          <span
            className="absolute -top-1 h-4 w-0.5 rounded-full bg-content-secondary shadow-[0_0_0_1px_var(--color-gray-900)]"
            style={{ left: `${((row.previousWeight ?? 0) / scaleMax) * 100}%` }}
            title={i18n.t('ui.overviewcharts.previousValue0', {
              value0: formatPercentage(row.previousWeight ?? 0),
            })}
          />
        )}
      </div>
    </div>
  )
}
