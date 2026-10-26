export const NAVIGATION_STATES = {
  tab: {
    active: 'border-accent text-content',
    inactive:
      'border-transparent text-content-subtle hover:text-content-secondary',
  },
  separatedTab: {
    active: 'border-b-accent text-content',
    inactive:
      'border-b-transparent text-content-subtle hover:text-content-secondary',
  },
} as const
