import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  matchByDataKey,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtFull, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { HoldingLabelTick } from '@/features/portfolio-charts/ConcentrationChart'
import type {
  AnnualConcentrationFrame,
  HistoricalConcentrationHolding,
  HistoricalConcentrationPoint,
} from './concentrationTrend.logic'
import { nextPlaybackIndex, shouldAnimateConcentration } from './concentrationTrend.logic'
import { interpolateRankedBars } from './rankedBarAnimation'

const matchHoldingByKey = matchByDataKey('key')

interface ConcentrationChartRow extends HistoricalConcentrationPoint {
  timestamp: number
  positionsTo25Delta: number | null
  positionsTo50Delta: number | null
  positionsTo75Delta: number | null
  positionsTo90Delta: number | null
}

interface TrendTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ConcentrationChartRow }>
}

interface HoldingTooltipProps {
  active?: boolean
  payload?: Array<{ payload: HistoricalConcentrationHolding }>
}

function timestamp(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

function formatDelta(value: number | null, suffix: string, fractionDigits = 1): string {
  if (value == null) return 'First observation'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(fractionDigits)} ${suffix} vs previous month`
}

function formatPositionCount(value: number): string {
  return `${value} ${value === 1 ? 'position' : 'positions'}`
}

function ConcentrationTrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload

  return (
    <TooltipBox minWidth={220}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>{shortMonth(row.date)}</div>
      <div className="mt-2 space-y-1" style={{ color: 'var(--tooltip-label)' }}>
        <div><span style={{ color: SEMANTIC_COLORS.risk }}>25%</span> {formatPositionCount(row.positionsTo25Pct)} <span className="text-gray-500">· {formatDelta(row.positionsTo25Delta, 'positions', 0)}</span></div>
        <div><span style={{ color: SEMANTIC_COLORS.totalChange }}>50%</span> {formatPositionCount(row.positionsTo50Pct)} <span className="text-gray-500">· {formatDelta(row.positionsTo50Delta, 'positions', 0)}</span></div>
        <div><span style={{ color: SEMANTIC_COLORS.netContributions }}>75%</span> {formatPositionCount(row.positionsTo75Pct)} <span className="text-gray-500">· {formatDelta(row.positionsTo75Delta, 'positions', 0)}</span></div>
        <div><span style={{ color: SEMANTIC_COLORS.portfolioValue }}>90%</span> {formatPositionCount(row.positionsTo90Pct)} <span className="text-gray-500">· {formatDelta(row.positionsTo90Delta, 'positions', 0)}</span></div>
      </div>
    </TooltipBox>
  )
}

function HistoricalHoldingTooltip({ active, payload }: HoldingTooltipProps) {
  if (!active || !payload?.length) return null
  const holding = payload[0].payload
  return (
    <TooltipBox minWidth={200}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>{holding.name}</div>
      <div className="mt-1" style={{ color: 'var(--tooltip-label)' }}>{fmtFull(holding.value)} · {holding.weight.toFixed(1)}%</div>
    </TooltipBox>
  )
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return prefersReducedMotion
}

function ChartLegend() {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-gray-500">
      {[
        ['25%', SEMANTIC_COLORS.risk],
        ['50%', SEMANTIC_COLORS.totalChange],
        ['75%', SEMANTIC_COLORS.netContributions],
        ['90%', SEMANTIC_COLORS.portfolioValue],
      ].map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded" style={{ background: color }} />{label}
        </span>
      ))}
    </div>
  )
}

function ConcentrationTrendContent({
  points,
  annualFrames,
}: {
  points: HistoricalConcentrationPoint[]
  annualFrames: AnnualConcentrationFrame[]
}) {
  const [frameIndex, setFrameIndex] = useState(() => Math.max(0, annualFrames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const animationEnabled = shouldAnimateConcentration(prefersReducedMotion)

  const chartData = useMemo<ConcentrationChartRow[]>(() => points.map((point, index) => {
    const previous = points[index - 1]
    return {
      ...point,
      timestamp: timestamp(point.date),
      positionsTo25Delta: previous ? point.positionsTo25Pct - previous.positionsTo25Pct : null,
      positionsTo50Delta: previous ? point.positionsTo50Pct - previous.positionsTo50Pct : null,
      positionsTo75Delta: previous ? point.positionsTo75Pct - previous.positionsTo75Pct : null,
      positionsTo90Delta: previous ? point.positionsTo90Pct - previous.positionsTo90Pct : null,
    }
  }), [points])

  useEffect(() => {
    if (!isPlaying || annualFrames.length < 2) return
    const interval = window.setInterval(() => {
      setFrameIndex((current) => {
        const next = nextPlaybackIndex(current, annualFrames.length)
        if (next.complete) setIsPlaying(false)
        return next.index
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [annualFrames.length, isPlaying])

  if (points.length < 2) {
    return (
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-300">Held-position concentration</h3>
          <p className="mt-0.5 text-xs text-gray-600">Monthly concentration of the positions effectively held.</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">
          Not enough concentration history for the current selection.
        </div>
      </section>
    )
  }

  const safeFrameIndex = Math.min(frameIndex, Math.max(0, annualFrames.length - 1))
  const selectedFrame = annualFrames[safeFrameIndex]
  const hoveredPoint = hoveredPointIndex == null ? undefined : points[hoveredPointIndex]
  const displayedPoint = hoveredPoint ?? selectedFrame
  const displayedHoldings = displayedPoint?.holdings.slice(0, 10) ?? []
  const selectedTimestamp = displayedPoint ? timestamp(displayedPoint.date) : undefined
  const dateDomain: [number, number] = [chartData[0].timestamp, chartData.at(-1)!.timestamp]

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (safeFrameIndex >= annualFrames.length - 1) setFrameIndex(0)
    setIsPlaying(annualFrames.length > 1)
  }

  function selectFrame(index: number) {
    setIsPlaying(false)
    setHoveredPointIndex(null)
    setFrameIndex(Math.max(0, Math.min(index, annualFrames.length - 1)))
  }

  function selectHoveredPoint(index: string | number | null | undefined) {
    const pointIndex = Number(index)
    if (!Number.isInteger(pointIndex) || pointIndex < 0 || pointIndex >= points.length) return
    setIsPlaying(false)
    setHoveredPointIndex(pointIndex)
  }

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-300">Held-position concentration</h3>
        <p className="mt-0.5 text-xs text-gray-600">Track how many of the largest held positions account for each portfolio threshold.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-gray-900 p-4">
          <h2 className="mb-1 text-sm font-medium text-gray-400">Minimum positions to reach portfolio share</h2>
          <p className="mb-3 text-xs text-gray-600">Minimum number of largest positions needed to reach each share of the portfolio.</p>
          <ChartLegend />
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive) selectHoveredPoint(state.activeTooltipIndex)
              }}
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="timestamp" type="number" scale="time" domain={dateDomain} tickFormatter={(value) => shortMonth(new Date(value).toISOString())} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 'auto']} allowDecimals={false} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
              {selectedTimestamp != null && <ReferenceLine x={selectedTimestamp} stroke={CHART_THEME.label} strokeDasharray="4 4" />}
              <Tooltip content={<ConcentrationTrendTooltip />} />
              <Line type="stepAfter" dataKey="positionsTo25Pct" stroke={SEMANTIC_COLORS.risk} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo50Pct" stroke={SEMANTIC_COLORS.totalChange} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo75Pct" stroke={SEMANTIC_COLORS.netContributions} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo90Pct" stroke={SEMANTIC_COLORS.portfolioValue} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {displayedPoint && (
          <div className="rounded-xl bg-gray-900 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-300">Largest holdings over time</h2>
              <p className="mt-0.5 text-xs text-gray-600">Hover the trend to inspect monthly snapshots; playback uses annual snapshots.</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-semibold tabular-nums text-gray-200">{displayedPoint.date.slice(0, 4)}</div>
              <div className="text-[11px] text-gray-600">Snapshot {displayedPoint.date}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" aria-label={isPlaying ? 'Pause concentration history' : 'Play concentration history'} aria-pressed={isPlaying} onClick={togglePlayback} disabled={annualFrames.length < 2} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">{isPlaying ? 'Pause' : 'Play'}</button>
            <button type="button" aria-label="Previous concentration year" disabled={safeFrameIndex === 0} onClick={() => selectFrame(safeFrameIndex - 1)} className="rounded-md border border-gray-700 px-2.5 py-1.5 text-xs text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" aria-label="Next concentration year" disabled={safeFrameIndex >= annualFrames.length - 1} onClick={() => selectFrame(safeFrameIndex + 1)} className="rounded-md border border-gray-700 px-2.5 py-1.5 text-xs text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            <label className="ml-0 flex min-w-[220px] flex-1 items-center gap-3 text-[11px] text-gray-500 sm:ml-2">
              <span>{annualFrames[0].year}</span>
              <input aria-label="Concentration year" type="range" min={0} max={annualFrames.length - 1} step={1} value={safeFrameIndex} onChange={(event) => selectFrame(Number(event.target.value))} className="min-w-0 flex-1 accent-blue-500" />
              <span>{annualFrames.at(-1)!.year}</span>
            </label>
          </div>

          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[520px]">
              <ResponsiveContainer width="100%" height={Math.max(280, displayedHoldings.length * 30)}>
                <BarChart layout="vertical" data={displayedHoldings} margin={{ top: 4, right: 52, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 'dataMax']} hide />
                  <YAxis dataKey="label" type="category" tick={<HoldingLabelTick />} tickLine={false} axisLine={false} width={260} />
                  <Tooltip content={<HistoricalHoldingTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
                  <Bar
                    dataKey="weight"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={animationEnabled}
                    animationDuration={450}
                    animationEasing="ease-in-out"
                    animationMatchBy={matchHoldingByKey}
                    animationInterpolateFn={interpolateRankedBars}
                  >
                    {displayedHoldings.map((holding, index) => <Cell key={holding.key} fill={index === 0 ? SEMANTIC_COLORS.risk : SEMANTIC_COLORS.neutralSeries} />)}
                    <LabelList dataKey="weight" position="right" formatter={(value: unknown) => `${Number(value).toFixed(1)}%`} style={{ fill: 'var(--chart-label)', fontSize: 11 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function ConcentrationTrendSection({
  points,
  annualFrames,
}: {
  points: HistoricalConcentrationPoint[]
  annualFrames: AnnualConcentrationFrame[]
}) {
  const dataKey = annualFrames.map((frame) =>
    `${frame.date}:${frame.holdings.map((holding) => `${holding.key}:${holding.value}`).join(',')}`,
  ).join(';')

  return <ConcentrationTrendContent key={dataKey} points={points} annualFrames={annualFrames} />
}
