import { useSyncExternalStore } from 'react'

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia?.(QUERY)
  media?.addEventListener('change', onChange)
  return () => media?.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia?.(QUERY).matches ?? false
}

function getServerSnapshot() {
  return false
}
