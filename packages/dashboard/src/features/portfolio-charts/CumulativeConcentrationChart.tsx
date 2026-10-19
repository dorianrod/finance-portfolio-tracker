import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MouseHandlerDataParam } from 'recharts'
import { fmtFull } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { cumulativeConcentrationCrosshair } from './portfolioCharts.logic'
import type { CumulativeConcentrationPoint } from './portfolioCharts.logic'

interface CumulativeConcentrationTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CumulativeConcentrationPoint }>
}

export function CumulativeConcentrationTooltip({
  active,
  payload,
}: CumulativeConcentrationTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const assetLabel = point.rank === 1 ? 'asset' : 'assets'

  return (
    <TooltipBox minWidth={220}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        Top {point.rank} {assetLabel} · {point.cumulativeWeight.toFixed(1)}%
      </div>
      <div className="mt-1" style={{ color: 'var(--tooltip-label)' }}>
        #{point.rank} {point.name}
      </div>
      <div className="mt-0.5" style={{ color: SEMANTIC_COLORS.riskSecondary }}>
        {fmtFull(point.value)} · {point.weight.toFixed(1)}%
      </div>
    </TooltipBox>
  )
}

export function CumulativeConcentrationChart({
  data,
  description,
}: {
  data: CumulativeConcentrationPoint[]
  description?: string
}) {
  const [activePoint, setActivePoint] = useState<CumulativeConcentrationPoint | null>(null)
  const crosshair = cumulativeConcentrationCrosshair(activePoint)
  const maxRank = data.at(-1)?.rank ?? 1

  function updateActivePoint(state: MouseHandlerDataParam) {
    if (!state.isTooltipActive || state.activeTooltipIndex == null) {
      setActivePoint(null)
      return
    }
    const index = Number(state.activeTooltipIndex)
    setActivePoint(Number.isInteger(index) ? data[index] ?? null : null)
  }

  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-300">Cumulative concentration</h2>
        <p className="mt-0.5 text-xs text-gray-600">
          {description ?? 'Share of the applicable portfolio held in the largest N assets.'}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          onMouseMove={updateActivePoint}
          onMouseLeave={() => setActivePoint(null)}
          onTouchMove={updateActivePoint}
          onTouchEnd={() => setActivePoint(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="rank"
            type="number"
            domain={[1, maxRank]}
            allowDecimals={false}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          {crosshair && (
            <>
              <ReferenceLine x={crosshair.x} stroke={CHART_THEME.label} strokeDasharray="4 4" />
              <ReferenceLine y={crosshair.y} stroke={CHART_THEME.label} strokeDasharray="4 4" />
            </>
          )}
          <Tooltip content={<CumulativeConcentrationTooltip />} cursor={false} />
          <Line
            type="linear"
            dataKey="cumulativeWeight"
            stroke={SEMANTIC_COLORS.risk}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: SEMANTIC_COLORS.risk }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 text-center text-[11px] text-gray-600">Number of assets</div>
    </div>
  )
}
