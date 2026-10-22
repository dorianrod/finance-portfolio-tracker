import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'jotai'
import { describe, expect, it } from 'vitest'
import { HoldingsViewTabs } from './HoldingsViewTabs.feature'

describe('HoldingsViewTabs', () => {
  it('renders both keyboard-focusable views and marks the active view', () => {
    const html = renderToStaticMarkup(
      <Provider>
        <HoldingsViewTabs />
      </Provider>,
    )

    expect(html).toContain('aria-label="Holdings views"')
    expect(html).toContain('id="holdings-positions-tab"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('Positions')
    expect(html).toContain('Underlying exposure')
    expect(html.match(/<button/g)).toHaveLength(2)
  })
})
