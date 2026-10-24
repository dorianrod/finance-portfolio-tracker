import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
import { positionUnderlyingPopoverAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionUnderlyingPopover.atoms'
import type { AllocationHoverTarget } from '@/domains/portfolio/shared/components/HoverAllocationPopover.view'

export function usePositionTableOverlays() {
  const [chart, setChart] = useState<ChartTarget | null>(null)
  const [savingsChart, setSavingsChart] = useState<SavingsChartTarget | null>(
    null,
  )
  const [allocationHover, setAllocationHover] =
    useState<AllocationHoverTarget | null>(null)
  const [underlyingPopover, setUnderlyingPopover] = useAtom(
    positionUnderlyingPopoverAtom,
  )
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current)
      hideTimeout.current = null
    }
  }, [])
  const scheduleHide = useCallback(() => {
    cancelHide()
    hideTimeout.current = setTimeout(() => {
      setChart(null)
      setSavingsChart(null)
      setAllocationHover(null)
      setUnderlyingPopover(null)
      hideTimeout.current = null
    }, 200)
  }, [cancelHide, setUnderlyingPopover])

  useEffect(
    () => () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      setUnderlyingPopover(null)
    },
    [setUnderlyingPopover],
  )

  return useMemo(
    () => ({
      allocationHover,
      cancelHide,
      chart,
      savingsChart,
      scheduleHide,
      setAllocationHover,
      setChart,
      setSavingsChart,
      setUnderlyingPopover,
      underlyingPopover,
    }),
    [
      allocationHover,
      cancelHide,
      chart,
      savingsChart,
      scheduleHide,
      setAllocationHover,
      setChart,
      setSavingsChart,
      setUnderlyingPopover,
      underlyingPopover,
    ],
  )
}
