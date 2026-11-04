import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export function useChartViewport() {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )
  const reveal = useCallback(() => setReady(true), [])

  useEffect(() => {
    const element = ref.current
    if (ready || !element || typeof IntersectionObserver === 'undefined') return
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (active && entries.some((entry) => entry.isIntersecting)) reveal()
    })
    const revealForPrint = () => {
      if (active) flushSync(reveal)
    }
    observer.observe(element)
    window.addEventListener('beforeprint', revealForPrint)
    return () => {
      active = false
      observer.disconnect()
      window.removeEventListener('beforeprint', revealForPrint)
    }
  }, [ready, reveal])

  return { ref, ready, reveal }
}
