import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TooltipBox } from './TooltipBox.view'

describe('TooltipBox', () => {
  it('retains the themed surface without exposing style overrides', () => {
    const html = renderToStaticMarkup(<TooltipBox>Details</TooltipBox>)
    expect(html).toContain('background:var(--tooltip-bg)')
    expect(html).toContain('border:1px solid var(--tooltip-border)')
    expect(html).toContain('Details')
  })

  it('preserves composed content in the raised variant', () => {
    const html = renderToStaticMarkup(
      <TooltipBox variant="raised">Details</TooltipBox>,
    )
    expect(html).toContain('Details')
    expect(html).not.toContain('variant=')
  })
})
