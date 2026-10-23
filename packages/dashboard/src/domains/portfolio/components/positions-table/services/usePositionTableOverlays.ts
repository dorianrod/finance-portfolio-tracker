import { useCallback, useRef, useState } from 'react'
import type { ChartTarget } from '@/domains/portfolio/components/hover-charts/HoverChart.feature'
import type { SavingsChartTarget } from '@/domains/portfolio/components/hover-charts/HoverSavingsChart.feature'
import type { AllocationHoverTarget } from '@/domains/portfolio/components/allocation-charts/HoverAllocationPopover.view'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/components/fund-holdings/FundPositionPopover.feature'

export function usePositionTableOverlays() {
  const [chart, setChart] = useState<ChartTarget | null>(null)
  const [savingsChart, setSavingsChart] = useState<SavingsChartTarget | null>(null)
  const [allocationHover, setAllocationHover] = useState<AllocationHoverTarget | null>(null)
  const [underlyingPopover, setUnderlyingPopover] = useState<FundPositionPopoverTarget | null>(null)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
  }, [])
  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setChart(null)
      setSavingsChart(null)
      setAllocationHover(null)
      setUnderlyingPopover(null)
    }, 200)
  }, [])

  return {
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
  }
}
