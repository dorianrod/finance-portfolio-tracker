// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { comparison } from '@/domains/portfolio/features/overview/mocks/overviewComparison.mock'

import { OverviewPeriodFilterView } from './OverviewPeriodFilter.view'

afterEach(cleanup)
describe('OverviewPeriodFilterView', () => {
  it('displays both supplied windows and invokes the supplied open action', async () => {
    const onOpen = vi.fn()
    render(
      <OverviewPeriodFilterView
        windows={comparison().windows}
        onOpen={onOpen}
      />,
    )
    expect(screen.getByText('21 Oct 2025 – 20 Oct 2026')).toBeDefined()
    expect(screen.getByText('21 Oct 2024 – 20 Oct 2025')).toBeDefined()
    await userEvent
      .setup()
      .click(
        screen.getByRole('button', { name: 'Edit current comparison period' }),
      )
    expect(onOpen).toHaveBeenCalledOnce()
  })
  it('does not activate the action during rendering', () => {
    const onOpen = vi.fn()
    render(
      <OverviewPeriodFilterView
        windows={comparison().windows}
        onOpen={onOpen}
      />,
    )
    expect(onOpen).not.toHaveBeenCalled()
  })
})
