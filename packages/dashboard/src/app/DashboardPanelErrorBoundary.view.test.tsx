import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { DashboardPanelErrorBoundary } from './DashboardPanelErrorBoundary.view'

describe('DashboardPanelErrorBoundary', () => {
  it('renders an accessible recovery action after a panel failure', () => {
    const boundary = new DashboardPanelErrorBoundary({
      children: <p>Panel content</p>,
      onRetry: vi.fn(),
    })
    boundary.state = { error: new Error('Chunk failed to load'), active: true }

    const html = renderToStaticMarkup(boundary.render())

    expect(html).toContain('role="alert"')
    expect(html).toContain('Unable to load this analysis.')
    expect(html).toContain('Reload dashboard')
  })
})
