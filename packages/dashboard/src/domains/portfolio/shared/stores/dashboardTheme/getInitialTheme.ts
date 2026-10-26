import type { Theme } from './dashboardTheme.types'
import { isTheme } from './isTheme'

export function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset.theme
    if (isTheme(theme)) return theme
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
    return 'dark'
  return 'light'
}
