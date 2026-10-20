import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart,
  matchByDataKey, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { fmtFull, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { HoldingLabelTick } from '@/features/portfolio-charts/ConcentrationChart'
import { ConcentrationModeToggle, type ConcentrationMode } from '@/features/portfolio-charts/ConcentrationModeToggle'
import type { HistoricalConcentrationHolding, HistoricalConcentrationPoint } from './concentrationTrend.logic'
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

function formatDelta(value: number | null): string {
  if (value == null) return 'First comparable observation'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)} positions vs previous month`
}

function formatPositionCount(value: number | null): string {
  if (value == null) return '—'
  return `${value} ${value === 1 ? 'position' : 'positions'}`
}

function ThresholdRow({ label, color, value, delta }: {
  label: string
  color: string
  value: number | null
  delta: number | null
}) {
  return (
    <div>
      <span style={{ color }}>{label}</span> {formatPositionCount(value)}{' '}
      <span className="text-gray-500">
        · {value == null ? 'Insufficient identified coverage' : formatDelta(delta)}
      </span>
    </div>
  )
}

function ConcentrationTrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <TooltipBox minWidth={250}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>{shortMonth(row.date)}</div>
      <div className="mt-1 text-xs" style={{ color: 'var(--tooltip-dim)' }}>Coverage: {row.coveragePct.toFixed(1)}%</div>
      <div className="mt-2 space-y-1" style={{ color: 'var(--tooltip-label)' }}>
        <ThresholdRow label="25%" color={SEMANTIC_COLORS.risk} value={row.positionsTo25Pct} delta={row.positionsTo25Delta} />
        <ThresholdRow label="50%" color={SEMANTIC_COLORS.totalChange} value={row.positionsTo50Pct} delta={row.positionsTo50Delta} />
        <ThresholdRow label="75%" color={SEMANTIC_COLORS.netContributions} value={row.positionsTo75Pct} delta={row.positionsTo75Delta} />
        <ThresholdRow label="90%" color={SEMANTIC_COLORS.portfolioValue} value={row.positionsTo90Pct} delta={row.positionsTo90Delta} />
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

function delta(current: number | null, previous: number | null | undefined): number | null {
  return current == null || previous == null ? null : current - previous
}

export function ConcentrationTrendSection({ heldPoints, lookThroughPoints, lookThroughAvailable }: {
  heldPoints: HistoricalConcentrationPoint[]
  lookThroughPoints: HistoricalConcentrationPoint[]
  lookThroughAvailable: boolean
}) {
  const [mode, setMode] = useState<ConcentrationMode>('held')
  const [selectedDate, setSelectedDate] = useState(() => heldPoints.at(-1)?.date ?? '')
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const animationEnabled = shouldAnimateConcentration(prefersReducedMotion)
  const points = mode === 'held' ? heldPoints : lookThroughPoints

  const chartData = useMemo<ConcentrationChartRow[]>(() => points.map((point, index) => {
    const previous = points[index - 1]
    return {
      ...point,
      timestamp: timestamp(point.date),
      positionsTo25Delta: delta(point.positionsTo25Pct, previous?.positionsTo25Pct),
      positionsTo50Delta: delta(point.positionsTo50Pct, previous?.positionsTo50Pct),
      positionsTo75Delta: delta(point.positionsTo75Pct, previous?.positionsTo75Pct),
      positionsTo90Delta: delta(point.positionsTo90Pct, previous?.positionsTo90Pct),
    }
  }), [points])
  const exactIndex = points.findIndex((point) => point.date === selectedDate)
  const selectedIndex = exactIndex >= 0 ? exactIndex : Math.max(0, points.length - 1)

  useEffect(() => {
    if (!isPlaying || points.length < 2) return
    const interval = window.setInterval(() => {
      setSelectedDate((currentDate) => {
        const currentIndex = Math.max(0, points.findIndex((point) => point.date === currentDate))
        const next = nextPlaybackIndex(currentIndex, points.length)
        if (next.complete) setIsPlaying(false)
        return points[next.index]?.date ?? currentDate
      })
    }, 500)
    return () => window.clearInterval(interval)
  }, [isPlaying, points])

  function changeMode(nextMode: ConcentrationMode) {
    if (nextMode === 'lookThrough' && !lookThroughAvailable) return
    setIsPlaying(false)
    setHoveredPointIndex(null)
    setMode(nextMode)
    const nextPoints = nextMode === 'held' ? heldPoints : lookThroughPoints
    if (!nextPoints.some((point) => point.date === selectedDate)) {
      setSelectedDate(nextPoints.at(-1)?.date ?? '')
    }
  }

  const heading = mode === 'held' ? 'Held-position concentration' : 'Underlying concentration'
  const description = mode === 'held'
    ? 'Track how many of the largest held positions account for each portfolio threshold.'
    : 'Track identified direct and fund look-through exposure. Missing fund detail lowers coverage and concentration.'

  if (points.length < 2) {
    return (
      <section>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300">{heading}</h3>
            <p className="mt-0.5 text-xs text-gray-600">{description}</p>
          </div>
          <ConcentrationModeToggle value={mode} onChange={changeMode} lookThroughDisabled={!lookThroughAvailable} />
        </div>
        {!lookThroughAvailable && <p className="mb-3 text-xs text-amber-500">Look-through history is unavailable until fund_holdings_history.csv is generated.</p>}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">
          Not enough concentration history for the current selection.
        </div>
      </section>
    )
  }

  const selectedPoint = points[selectedIndex] ?? points.at(-1)
  const hoveredPoint = hoveredPointIndex == null ? undefined : points[hoveredPointIndex]
  const displayedPoint = hoveredPoint ?? selectedPoint
  const displayedHoldings = displayedPoint?.holdings.slice(0, 10) ?? []
  const selectedTimestamp = selectedPoint ? timestamp(selectedPoint.date) : undefined
  const dateDomain: [number, number] = [chartData[0].timestamp, chartData.at(-1)!.timestamp]

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (selectedIndex >= points.length - 1) setSelectedDate(points[0].date)
    setHoveredPointIndex(null)
    setIsPlaying(true)
  }

  function selectPoint(index: number) {
    setIsPlaying(false)
    setHoveredPointIndex(null)
    const safeIndex = Math.max(0, Math.min(index, points.length - 1))
    setSelectedDate(points[safeIndex].date)
  }

  function selectHoveredPoint(index: string | number | null | undefined) {
    const pointIndex = Number(index)
    if (!Number.isInteger(pointIndex) || pointIndex < 0 || pointIndex >= points.length) return
    setIsPlaying(false)
    setHoveredPointIndex(pointIndex)
  }

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300">{heading}</h3>
          <p className="mt-0.5 text-xs text-gray-600">{description}</p>
          {!lookThroughAvailable && <p className="mt-1 text-xs text-amber-500">Look-through history is unavailable until fund_holdings_history.csv is generated.</p>}
        </div>
        <ConcentrationModeToggle value={mode} onChange={changeMode} lookThroughDisabled={!lookThroughAvailable} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-gray-900 p-4">
          <h2 className="mb-1 text-sm font-medium text-gray-400">Minimum positions to reach portfolio share</h2>
          <p className="mb-3 text-xs text-gray-600">Unavailable thresholds appear as gaps when identified exposure cannot reach them.</p>
          <ChartLegend />
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} onMouseMove={(state) => {
              if (state.isTooltipActive) selectHoveredPoint(state.activeTooltipIndex)
            }} onMouseLeave={() => setHoveredPointIndex(null)}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="timestamp" type="number" scale="time" domain={dateDomain} tickFormatter={(value) => shortMonth(new Date(value).toISOString())} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 'auto']} allowDecimals={false} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
              {selectedTimestamp != null && <ReferenceLine x={selectedTimestamp} stroke={CHART_THEME.label} strokeDasharray="4 4" />}
              <Tooltip content={<ConcentrationTrendTooltip />} />
              <Line type="stepAfter" dataKey="positionsTo25Pct" stroke={SEMANTIC_COLORS.risk} strokeWidth={2.5} dot={{ r: 2, strokeWidth: 1 }} connectNulls={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo50Pct" stroke={SEMANTIC_COLORS.totalChange} strokeWidth={2} dot={{ r: 2, strokeWidth: 1 }} connectNulls={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo75Pct" stroke={SEMANTIC_COLORS.netContributions} strokeWidth={2} dot={{ r: 2, strokeWidth: 1 }} connectNulls={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="positionsTo90Pct" stroke={SEMANTIC_COLORS.portfolioValue} strokeWidth={2} dot={{ r: 2, strokeWidth: 1 }} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {displayedPoint && (
          <div className="rounded-xl bg-gray-900 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-300">Largest holdings over time</h2>
                <p className="mt-0.5 text-xs text-gray-600">Hover to preview; the slider and playback use every monthly snapshot.</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-lg font-semibold tabular-nums text-gray-200">{shortMonth(displayedPoint.date)}</div>
                <div className="text-[11px] text-gray-600">Snapshot {displayedPoint.date}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
              <span>Coverage <strong className="font-semibold text-gray-300">{displayedPoint.coveragePct.toFixed(1)}%</strong></span>
              <span>Identified <strong className="font-semibold text-gray-300">{fmtFull(displayedPoint.identifiedValue)}</strong></span>
              <span>Undisclosed funds <strong className="font-semibold text-gray-300">{fmtFull(displayedPoint.undisclosedValue)}</strong></span>
              <span>Opaque <strong className="font-semibold text-gray-300">{fmtFull(displayedPoint.opaqueValue)}</strong></span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" aria-label={isPlaying ? 'Pause concentration history' : 'Play concentration history'} aria-pressed={isPlaying} onClick={togglePlayback} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">{isPlaying ? 'Pause' : 'Play'}</button>
              <button type="button" aria-label="Previous concentration month" disabled={selectedIndex === 0} onClick={() => selectPoint(selectedIndex - 1)} className="rounded-md border border-gray-700 px-2.5 py-1.5 text-xs text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button type="button" aria-label="Next concentration month" disabled={selectedIndex >= points.length - 1} onClick={() => selectPoint(selectedIndex + 1)} className="rounded-md border border-gray-700 px-2.5 py-1.5 text-xs text-gray-300 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              <label className="ml-0 flex min-w-[220px] flex-1 items-center gap-3 text-[11px] text-gray-500 sm:ml-2">
                <span>{shortMonth(points[0].date)}</span>
                <input aria-label="Concentration month" type="range" min={0} max={points.length - 1} step={1} value={selectedIndex} onChange={(event) => selectPoint(Number(event.target.value))} className="min-w-0 flex-1 accent-blue-500" />
                <span>{shortMonth(points.at(-1)!.date)}</span>
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
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]} isAnimationActive={animationEnabled} animationDuration={450} animationEasing="ease-in-out" animationMatchBy={matchHoldingByKey} animationInterpolateFn={interpolateRankedBars}>
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
