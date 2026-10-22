import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HoldingLabelTick } from './ConcentrationChart'

describe('HoldingLabelTick', () => {
  it('reserves a wide clipped label area and exposes the full name as a tooltip', () => {
    const name = 'Example Asia Pacific Equity Enhanced Fund USD (Acc)'
    const html = renderToStaticMarkup(
      <svg><HoldingLabelTick x={300} y={20} payload={{ value: name }} /></svg>,
    )

    expect(html).toContain('width="250"')
    expect(html).toContain('class="truncate')
    expect(html).toContain(`title="${name}"`)
    expect(html).toContain(`>${name}</div>`)
  })
})
