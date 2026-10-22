import { Component, type ErrorInfo, type ReactNode } from 'react'

interface DashboardPanelErrorBoundaryProps {
  children: ReactNode
  onRetry: () => void
}

interface DashboardPanelErrorBoundaryState {
  error: Error | null
}

export class DashboardPanelErrorBoundary extends Component<
  DashboardPanelErrorBoundaryProps,
  DashboardPanelErrorBoundaryState
> {
  state: DashboardPanelErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): DashboardPanelErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Dashboard panel failed to render', error, errorInfo)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div
        className="mb-6 rounded-card border border-danger/40 bg-surface p-8 text-center"
        role="alert"
      >
        <p className="text-sm font-medium text-danger">Unable to load this analysis.</p>
        <p className="mt-2 text-sm text-content-subtle">
          Reload the dashboard to try downloading the panel again.
        </p>
        <button
          type="button"
          className="mt-4 rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-sm font-medium text-content hover:bg-surface"
          onClick={this.props.onRetry}
        >
          Reload dashboard
        </button>
      </div>
    )
  }
}
