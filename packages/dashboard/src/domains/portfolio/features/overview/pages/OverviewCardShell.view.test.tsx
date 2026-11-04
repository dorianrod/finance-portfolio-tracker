// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/transformers/resetFilters'

import { OverviewCardShell } from './OverviewCardShell.view'

afterEach(cleanup)
it('opens details while the tooltip action preserves navigation isolation', async () => {
  const user = userEvent.setup()
  const onOpen = vi.fn()
  render(
    <OverviewCardShell
      title="Portfolio value"
      description="Value explanation"
      eyebrow="At period end"
      accent="highlight"
      scope={{ account: 'filterable', period: 'as-of' }}
      scopeContext={{ filters: resetFilters(), accountLabels: {} }}
      onOpen={onOpen}
    >
      Visible metric
    </OverviewCardShell>,
  )
  await user.click(screen.getByRole('button', { name: 'More information' }))
  expect(screen.getByRole('tooltip').textContent).toContain('All accounts')
  expect(onOpen).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  await user.click(
    screen.getByRole('button', { name: 'Open Portfolio value details' }),
  )
  expect(onOpen).toHaveBeenCalledOnce()
})
