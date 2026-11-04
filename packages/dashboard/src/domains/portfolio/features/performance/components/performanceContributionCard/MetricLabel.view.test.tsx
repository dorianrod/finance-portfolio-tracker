// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/transformers/resetFilters'

import { MetricLabel } from './MetricLabel.view'

afterEach(cleanup)
it('reveals prepared metric scope without query or store providers', async () => {
  const user = userEvent.setup()
  render(
    <MetricLabel
      label="Measured assets"
      tooltip="Measurement explanation"
      scope={{ account: 'filterable', period: 'as-of' }}
      scopeContext={{ filters: resetFilters(), accountLabels: {} }}
    />,
  )
  await user.click(screen.getByRole('button', { name: 'More information' }))
  expect(screen.getByRole('tooltip').textContent).toContain(
    'Measurement explanation',
  )
  expect(screen.getByRole('tooltip').textContent).toContain('All accounts')
})
