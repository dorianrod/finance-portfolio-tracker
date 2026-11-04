import type { Theme } from '@/app/stores/theme/dashboardTheme.types'
import { isTheme } from '@/app/stores/theme/isTheme'

export function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset['theme']
    if (isTheme(theme)) return theme
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )
    return 'dark'
  return 'light'
}
