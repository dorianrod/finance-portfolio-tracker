import { Component, type ReactNode } from 'react'

/** Source errors are displayed by the persistent shell from the same query cache. */
export class DashboardSourceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override render() {
    return this.state.failed ? null : this.props.children
  }
}
