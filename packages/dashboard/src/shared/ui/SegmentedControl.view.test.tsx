import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SegmentedControl, SegmentedControlItem } from './SegmentedControl.view'

describe('SegmentedControl', () => {
  it('exposes one labelled group and pressed state for each option', () => {
    const html = renderToStaticMarkup(
      <SegmentedControl label="Chart scale">
        <SegmentedControlItem active>Value</SegmentedControlItem>
        <SegmentedControlItem active={false}>Percentage</SegmentedControlItem>
      </SegmentedControl>,
    )

    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Chart scale"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('bg-accent-solid')
    expect(html).toContain('text-content-subtle')
  })
})
