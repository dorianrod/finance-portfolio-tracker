import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useEffectEvent } from 'react'

import { nextPlaybackIndex } from '@/domains/portfolio/features/diversification/features/concentration/helpers/presenters/concentrationPlayback/nextPlaybackIndex'
import { concentrationTrendDateAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendDateAtom'
import { concentrationTrendPlayingAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendPlayingAtom'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'

export function useConcentrationPlayback(
  points: HistoricalConcentrationPoint[],
  selectedIndex: number,
): void {
  const isPlaying = useAtomValue(concentrationTrendPlayingAtom)
  const setIsPlaying = useSetAtom(concentrationTrendPlayingAtom)
  const setSelectedDate = useSetAtom(concentrationTrendDateAtom)
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
}
