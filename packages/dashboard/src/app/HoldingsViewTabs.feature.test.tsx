import { Provider } from 'jotai'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import { HoldingsViewTabs } from './HoldingsViewTabs.feature'

describe('HoldingsViewTabs', () => {
  it('renders both keyboard-focusable views and marks the active view', () => {
    const html = renderToStaticMarkup(
      <Provider>
        <ViewNavigation>
          <HoldingsViewTabs />
        </ViewNavigation>
      </Provider>,
    )

    expect(html).toContain('aria-label="Holdings views"')
    expect(html).toMatch(/aria-controls="[^"]+-positions-panel"/)
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('Positions')
    expect(html).toContain('Underlying exposure')
    expect(html.match(/<button/g)).toHaveLength(2)
  })
})
