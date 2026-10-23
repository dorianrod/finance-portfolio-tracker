import { useEffect, useRef } from 'react'

export function useCloseAccountTreeOnOutsideClick(
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open, setOpen])

  return containerRef
}
