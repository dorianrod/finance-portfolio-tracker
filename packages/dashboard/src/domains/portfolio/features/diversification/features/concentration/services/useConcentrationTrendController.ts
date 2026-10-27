import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react'

import { buildConcentrationChartRows } from '@/domains/portfolio/features/diversification/features/concentration/helpers/presenters/buildConcentrationChartRows'
import { nextPlaybackIndex } from '@/domains/portfolio/features/diversification/features/concentration/helpers/presenters/concentrationPlayback/nextPlaybackIndex'
import { shouldAnimateConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/presenters/concentrationPlayback/shouldAnimateConcentration'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'

export function useConcentrationTrendController(
  heldPoints: HistoricalConcentrationPoint[],
  lookThroughPoints: HistoricalConcentrationPoint[],
  lookThroughAvailable: boolean,
) {
  const [preferredMode, setMode] = useState<ConcentrationMode>('held')
  const [selectedDate, setSelectedDate] = useState(
    () => heldPoints.at(-1)?.date ?? null,
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  )
  const prefersReducedMotion = usePrefersReducedMotion()
  const animationEnabled = shouldAnimateConcentration(prefersReducedMotion)
  const mode =
    preferredMode === 'lookThrough' && !lookThroughAvailable
      ? 'held'
      : preferredMode
  const points = mode === 'held' ? heldPoints : lookThroughPoints
  const chartData = useMemo(() => buildConcentrationChartRows(points), [points])
  const exactIndex = points.findIndex(
    (point) => point.date.getTime() === selectedDate?.getTime(),
  )
  const selectedIndex =
    exactIndex >= 0 ? exactIndex : Math.max(0, points.length - 1)

  const advancePlayback = useEffectEvent(() => {
    const next = nextPlaybackIndex(selectedIndex, points.length)
    setSelectedDate(points[next.index]?.date ?? null)
    if (next.complete) setIsPlaying(false)
  })

  useEffect(() => {
    if (!isPlaying || points.length < 2) return
    const interval = window.setInterval(advancePlayback, 500)
    return () => window.clearInterval(interval)
  }, [isPlaying, points.length])

  const changeMode = useCallback(
    (nextMode: ConcentrationMode) => {
      if (nextMode === 'lookThrough' && !lookThroughAvailable) return
      setIsPlaying(false)
      setHoveredPointIndex(null)
      setMode(nextMode)
      const nextPoints = nextMode === 'held' ? heldPoints : lookThroughPoints
      if (
        !nextPoints.some(
          (point) => point.date.getTime() === selectedDate?.getTime(),
        )
      ) {
        setSelectedDate(nextPoints.at(-1)?.date ?? null)
      }
    },
    [heldPoints, lookThroughAvailable, lookThroughPoints, selectedDate],
  )

  const togglePlayback = useCallback(() => {
    if (points.length < 2) return
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (selectedIndex >= points.length - 1) setSelectedDate(points[0].date)
    setHoveredPointIndex(null)
    setIsPlaying(true)
  }, [isPlaying, points, selectedIndex])

  const selectPoint = useCallback(
    (index: number) => {
      if (points.length === 0 || !Number.isInteger(index)) return
      setIsPlaying(false)
      setHoveredPointIndex(null)
      const safeIndex = Math.max(0, Math.min(index, points.length - 1))
      setSelectedDate(points[safeIndex].date)
    },
    [points],
  )

  const selectHoveredPoint = useCallback(
    (index: string | number | null | undefined) => {
      if (index == null || index === '') return
      const pointIndex = Number(index)
      if (
        !Number.isInteger(pointIndex) ||
        pointIndex < 0 ||
        pointIndex >= points.length
      )
        return
      setIsPlaying(false)
      setHoveredPointIndex(pointIndex)
    },
    [points],
  )

  const selectedPoint = points[selectedIndex]
  const hoveredPoint =
    hoveredPointIndex == null ? undefined : points[hoveredPointIndex]
  const displayedPoint = hoveredPoint ?? selectedPoint
  const displayedHoldings = useMemo(
    () => displayedPoint?.holdings.slice(0, 10) ?? [],
    [displayedPoint],
  )
  const selectedTimestamp = selectedPoint?.date.getTime()
  const dateDomain = useMemo<[number, number]>(
    () =>
      chartData.length > 0
        ? [chartData[0].timestamp, chartData.at(-1)!.timestamp]
        : [0, 0],
    [chartData],
  )

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  )
}

export type { ConcentrationChartRow } from '@/domains/portfolio/features/diversification/features/concentration/helpers/presenters/buildConcentrationChartRows'

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
