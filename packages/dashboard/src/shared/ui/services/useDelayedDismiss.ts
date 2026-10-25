import { useCallback, useEffect, useMemo, useRef } from 'react'

export function useDelayedDismiss(onDismiss: () => void, delay = 200) {
  const callback = useRef(onDismiss)
  useEffect(() => {
    callback.current = onDismiss
  }, [onDismiss])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }, [])
  const schedule = useCallback(() => {
    cancel()
    timer.current = setTimeout(() => {
      callback.current()
      timer.current = null
    }, delay)
  }, [cancel, delay])
  useEffect(() => cancel, [cancel])
  return useMemo(() => ({ cancel, schedule }), [cancel, schedule])
}
