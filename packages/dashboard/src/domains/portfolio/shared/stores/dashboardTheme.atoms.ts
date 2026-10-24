import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export type Theme = 'dark' | 'light'
export const THEME_STORAGE_KEY = 'finance-dashboard-theme:v1'

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset.theme
    if (isTheme(theme)) return theme
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    return 'dark'
  return 'light'
}

const NOOP_STORAGE = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

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
  subscribe(key: string, callback: (value: Theme) => void, initialValue: Theme) {
    return (
      jsonStorage.subscribe?.(
        key,
        (value) => callback(isTheme(value) ? value : initialValue),
        initialValue,
      ) ?? (() => {})
    )
  },
}

export const DEFAULT_DASHBOARD_THEME = getInitialTheme()
export const dashboardThemeAtom = atomWithStorage<Theme>(
  THEME_STORAGE_KEY,
  DEFAULT_DASHBOARD_THEME,
  themeStorage,
  { getOnInit: true },
)
