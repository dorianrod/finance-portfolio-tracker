import { InfoTooltip } from './InfoTooltip'

interface KpiProps {
  label: string
  tooltip: string
  value: string
  valueColor?: string
  sub?: string
  subColor?: string
  subSmall?: string
}

export function Kpi({ label, tooltip, value, valueColor, sub, subColor, subSmall }: KpiProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center text-xs text-gray-500 uppercase tracking-wider">
        {label}
        <InfoTooltip text={tooltip} />
      </span>
      <span className={`text-base font-semibold ${valueColor ?? 'text-white'}`}>{value}</span>
      {sub && <span className={`text-xs ${subColor ?? 'text-gray-400'}`}>{sub}</span>}
      {subSmall && <span className="text-xs text-gray-600">{subSmall}</span>}
    </div>
  )
}
