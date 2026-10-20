import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ConcentrationModeToggle } from './ConcentrationModeToggle'

describe('ConcentrationModeToggle', () => {
  it('names the held-position and look-through concentration methods', () => {
    const html = renderToStaticMarkup(
      <ConcentrationModeToggle value="held" onChange={() => undefined} />,
    )

    expect(html).toContain('Held positions')
    expect(html).toContain('Look-through')
  })

  it('can disable look-through when historical holdings are unavailable', () => {
    const html = renderToStaticMarkup(
      <ConcentrationModeToggle value="held" onChange={() => undefined} lookThroughDisabled />,
    )

    expect(html).toContain('Historical underlying holdings are unavailable')
    expect(html).toContain('disabled=""')
  })
})
