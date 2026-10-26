import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TooltipBox } from './TooltipBox.view'

describe('TooltipBox', () => {
  it('retains the themed surface when the caller supplies layout classes', () => {
    const html = renderToStaticMarkup(
      <TooltipBox className="w-full" minWidth={160}>
        Details
      </TooltipBox>,
    )
    expect(html).toContain('background:var(--tooltip-bg)')
    expect(html).toContain('border:1px solid var(--tooltip-border)')
    expect(html).toContain('min-width:160px')
    expect(html).toContain('class="w-full"')
  })

  it('provides a raised variant with caller spacing', () => {
    const html = renderToStaticMarkup(
      <TooltipBox variant="raised" className="p-3">
        Details
      </TooltipBox>,
    )
    expect(html).toContain('bg-surface-raised')
    expect(html).toContain('shadow-xl')
    expect(html).toContain('p-3')
    expect(html).not.toContain('variant=')
  })
})
