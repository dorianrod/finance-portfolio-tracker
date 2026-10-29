import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import type { Theme } from '@/app/stores/theme/dashboardTheme.types'
import { DEFAULT_DASHBOARD_THEME } from '@/app/stores/theme/defaultDashboardTheme'
import { isTheme } from '@/app/stores/theme/isTheme'
import { THEME_STORAGE_KEY } from '@/app/stores/theme/themeStorageKey'

const NOOP_STORAGE = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const jsonStorage = createJSONStorage<Theme>(() => {
  try {
    return window.localStorage
  } catch {
    return NOOP_STORAGE
  }
})

const themeStorage = {
  getItem(key: string, initialValue: Theme): Theme {
    try {
      const value: unknown = jsonStorage.getItem(key, initialValue)
      return isTheme(value) ? value : initialValue
    } catch {
      return initialValue
    }
  },
  setItem(key: string, value: Theme): void {
    try {
      jsonStorage.setItem(key, value)
    } catch {
      /* Storage may be disabled or full. */
    }
  },
  removeItem(key: string): void {
    try {
      jsonStorage.removeItem(key)
    } catch {
      /* Storage may be disabled. */
    }
  },
  subscribe(
    key: string,
    callback: (value: Theme) => void,
    initialValue: Theme,
  ) {
    return (
      jsonStorage.subscribe?.(
        key,
        (value) => callback(isTheme(value) ? value : initialValue),
        initialValue,
      ) ?? (() => {})
    )
  },
}

export const dashboardThemeAtom = atomWithStorage<Theme>(
  THEME_STORAGE_KEY,
  DEFAULT_DASHBOARD_THEME,
  themeStorage,
  { getOnInit: true },
)
