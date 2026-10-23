import { atom } from 'jotai'

export type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.dataset.theme
    if (theme === 'dark' || theme === 'light') return theme
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const dashboardThemeAtom = atom<Theme>(getInitialTheme())
