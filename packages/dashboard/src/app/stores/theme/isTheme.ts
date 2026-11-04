import type { Theme } from '@/app/stores/theme/dashboardTheme.types'

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}
