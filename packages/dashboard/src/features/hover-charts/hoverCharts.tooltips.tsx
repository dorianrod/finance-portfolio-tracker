import { fmt, fmtDec } from '@/shared/format/money'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { RollingUnitPricePerf } from './RollingUnitPricePerf'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OpSummary({ data }: { data: any }) {
  if (!data.buyAmount && !data.sellAmount) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
      {data.buyAmount != null && (
        <p className="text-blue-400">▲ Buy: {fmt.format(data.buyAmount)}</p>
      )}
      {data.sellAmount != null && (
        <>
          <p className="text-orange-400">▼ Sell: {fmt.format(data.sellAmount)}</p>
          {data.sellGain != null && (
            <p className={data.sellGain >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              P&L: {fmt.format(data.sellGain)}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TooltipPortfolio({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valeur = payload.find((p: any) => p.dataKey === 'Value')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cout = payload.find((p: any) => p.dataKey === 'Cost basis')
  const data = payload[0]?.payload
  return (
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2">{label}</p>
      {valeur && <p style={{ color: valeur.color }}>{valeur.name}: {fmt.format(valeur.value)}</p>}
      {cout && <p style={{ color: cout.color }}>{cout.name}: {fmt.format(cout.value)}</p>}
      {valeur && cout && (
        <p className={`mt-1 font-semibold ${valeur.value >= cout.value ? 'text-emerald-400' : 'text-red-400'}`}>
          Unrealized: {fmt.format(valeur.value - cout.value)}
        </p>
      )}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TooltipUnit({ active, payload, label, series }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const data = p?.payload
  return (
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p style={{ color: p.color }}>Unit price: {fmtDec.format(p.value)}</p>
      {series && <RollingUnitPricePerf series={series} label={label} />}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SavingsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const balance = payload.find((p: any) => p.dataKey === 'balance')?.value ?? 0
  const delta: number = payload[0]?.payload?.delta ?? 0
  const monthStr: string = payload[0]?.payload?.month ?? ''
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(monthStr + '-02').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Balance: {fmt.format(balance)}</div>
      {delta !== 0 && (
        <div style={{ color: delta >= 0 ? '#60a5fa' : '#fca5a5' }}>
          {delta >= 0 ? '▲' : '▼'} {fmt.format(Math.abs(delta))}
        </div>
      )}
    </TooltipBox>
  )
}
