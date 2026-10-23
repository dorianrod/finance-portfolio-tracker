import { useEffect, useRef, useState } from 'react'

export function useTooltipPosition(visible: boolean) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!visible || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPosition({ top: rect.bottom + 6, left: rect.left })
  }, [visible])

  return { anchorRef, position }
}
