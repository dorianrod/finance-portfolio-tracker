import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ConcentrationMode } from '@/domains/portfolio/components/portfolio-charts/ConcentrationModeToggle.view'
import type { HistoricalConcentrationPoint } from '../helpers/calculators/buildConcentrationTrend'
import { nextPlaybackIndex, shouldAnimateConcentration } from '../helpers/calculators/buildConcentrationTrend'

export interface ConcentrationChartRow extends HistoricalConcentrationPoint {
  timestamp: number
  positionsTo25Delta: number | null
  positionsTo50Delta: number | null
  positionsTo75Delta: number | null
  positionsTo90Delta: number | null
}

function timestamp(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

function delta(current: number | null, previous: number | null | undefined): number | null {
  return current == null || previous == null ? null : current - previous
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

export function useConcentrationTrendController(
  heldPoints: HistoricalConcentrationPoint[],
  lookThroughPoints: HistoricalConcentrationPoint[],
  lookThroughAvailable: boolean,
) {
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

  const changeMode = useCallback((nextMode: ConcentrationMode) => {
    if (nextMode === 'lookThrough' && !lookThroughAvailable) return
    setIsPlaying(false)
    setHoveredPointIndex(null)
    setMode(nextMode)
    const nextPoints = nextMode === 'held' ? heldPoints : lookThroughPoints
    if (!nextPoints.some((point) => point.date === selectedDate)) {
      setSelectedDate(nextPoints.at(-1)?.date ?? '')
    }
  }, [heldPoints, lookThroughAvailable, lookThroughPoints, selectedDate])

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (selectedIndex >= points.length - 1) setSelectedDate(points[0].date)
    setHoveredPointIndex(null)
    setIsPlaying(true)
  }, [isPlaying, points, selectedIndex])

  const selectPoint = useCallback((index: number) => {
    setIsPlaying(false)
    setHoveredPointIndex(null)
    const safeIndex = Math.max(0, Math.min(index, points.length - 1))
    setSelectedDate(points[safeIndex].date)
  }, [points])

  const selectHoveredPoint = useCallback((index: string | number | null | undefined) => {
    const pointIndex = Number(index)
    if (!Number.isInteger(pointIndex) || pointIndex < 0 || pointIndex >= points.length) return
    setIsPlaying(false)
    setHoveredPointIndex(pointIndex)
  }, [points])

  const selectedPoint = points[selectedIndex] ?? points.at(-1)
  const hoveredPoint = hoveredPointIndex == null ? undefined : points[hoveredPointIndex]
  const displayedPoint = hoveredPoint ?? selectedPoint
  const displayedHoldings = displayedPoint?.holdings.slice(0, 10) ?? []
  const selectedTimestamp = selectedPoint ? timestamp(selectedPoint.date) : undefined
  const dateDomain: [number, number] = chartData.length > 0
    ? [chartData[0].timestamp, chartData.at(-1)!.timestamp]
    : [0, 0]

  return {
    animationEnabled,
    changeMode,
    chartData,
    dateDomain,
    displayedHoldings,
    displayedPoint,
    isPlaying,
    mode,
    points,
    selectHoveredPoint,
    selectPoint,
    selectedIndex,
    selectedTimestamp,
    setHoveredPointIndex,
    togglePlayback,
  }
}
