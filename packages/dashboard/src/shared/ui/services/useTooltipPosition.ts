import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export function useTooltipPosition(visible: boolean) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!visible) return
    const measure = () => {
      if (!anchorRef.current || !tooltipRef.current) return
      const anchor = anchorRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current.getBoundingClientRect()
      const left = Math.max(
        8,
        Math.min(anchor.left, window.innerWidth - tooltip.width - 8),
      )
      const fitsBelow =
        anchor.bottom + 6 + tooltip.height <= window.innerHeight - 8
      const top = fitsBelow
        ? anchor.bottom + 6
        : Math.max(8, anchor.top - tooltip.height - 6)
      setPosition((current) =>
        current.top === top && current.left === left ? current : { top, left },
      )
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [visible])

  return useMemo(
    () => ({ anchorRef, tooltipRef, position }),
    [anchorRef, tooltipRef, position],
  )
}
