import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { OverviewPeriodFilter } from './OverviewPeriodFilter'

describe('OverviewPeriodFilter', () => {
  it('shows both exact comparison windows in a compact filter control', () => {
    const markup = renderToStaticMarkup(
      <OverviewPeriodFilter
        windows={{
          current: { start: '2025-10-21', end: '2026-10-20' },
          previous: { start: '2024-10-21', end: '2025-10-20' },
          defaultedToTrailingYear: true,
        }}
        onEdit={vi.fn()}
      />,
    )

    expect(markup).toContain('Current')
    expect(markup).toContain('21 Oct 2025 – 20 Oct 2026')
    expect(markup).toContain('Previous')
    expect(markup).toContain('21 Oct 2024 – 20 Oct 2025')
    expect(markup).toContain('aria-label="Edit current comparison period"')
    expect(markup).not.toContain('Trailing 12 months')
  })
})
