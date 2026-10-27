import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { positionAllocationPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionAllocationPreviewAtom'
import { positionChartPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionChartPreviewAtom'
import { positionSavingsPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionSavingsPreviewAtom'
import { positionUnderlyingPopoverAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionUnderlyingPopover.atoms'
import { useDelayedDismiss } from '@/shared/ui/services/useDelayedDismiss'

export function usePositionTableOverlays() {
  const [chart, setChart] = useAtom(positionChartPreviewAtom)
  const [savingsChart, setSavingsChart] = useAtom(positionSavingsPreviewAtom)
  const [allocationHover, setAllocationHover] = useAtom(
    positionAllocationPreviewAtom,
  )
  const [underlyingPopover, setUnderlyingPopover] = useAtom(
    positionUnderlyingPopoverAtom,
  )
  const dismiss = useCallback(() => {
    setChart(null)
    setSavingsChart(null)
    setAllocationHover(null)
    setUnderlyingPopover(null)
  }, [setChart, setSavingsChart, setAllocationHover, setUnderlyingPopover])
  const { cancel: cancelHide, schedule: scheduleHide } =
    useDelayedDismiss(dismiss)

  useEffect(
    () => () => {
      dismiss()
    },
    [dismiss],
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
