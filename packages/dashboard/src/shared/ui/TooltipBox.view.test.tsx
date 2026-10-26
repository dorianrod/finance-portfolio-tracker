import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TooltipBox } from './TooltipBox.view'

describe('TooltipBox', () => {
  it('retains the themed surface without exposing style overrides', () => {
    const html = renderToStaticMarkup(<TooltipBox>Details</TooltipBox>)
    expect(html).toContain('background:var(--tooltip-bg)')
    expect(html).toContain('border:1px solid var(--tooltip-border)')
    expect(html).toContain('w-72')
    expect(html).toContain('px-3 py-2')
  })

  it('provides a raised variant with standardized spacing', () => {
    const html = renderToStaticMarkup(
      <TooltipBox variant="raised">Details</TooltipBox>,
    )
    expect(html).toContain('bg-surface-raised')
    expect(html).toContain('shadow-xl')
    expect(html).toContain('px-3 py-2')
    expect(html).not.toContain('variant=')
  })
})
