export type DashboardLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready' }
