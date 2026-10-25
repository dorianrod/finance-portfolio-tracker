import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
import { positionUnderlyingPopoverAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionUnderlyingPopover.atoms'
import type { AllocationHoverTarget } from '@/domains/portfolio/shared/components/HoverAllocationPopover.view'
import { useDelayedDismiss } from '@/shared/ui/services/useDelayedDismiss'

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
  const dismiss = useCallback(() => {
    setChart(null)
    setSavingsChart(null)
    setAllocationHover(null)
    setUnderlyingPopover(null)
  }, [setUnderlyingPopover])
  const { cancel: cancelHide, schedule: scheduleHide } =
    useDelayedDismiss(dismiss)

  useEffect(
    () => () => {
      setUnderlyingPopover(null)
    },
    [setUnderlyingPopover],
  )

  return useMemo(
    () => ({
      allocationHover,
      dismiss,
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
      dismiss,
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
