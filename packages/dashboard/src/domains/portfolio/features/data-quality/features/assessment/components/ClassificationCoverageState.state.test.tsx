import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { ClassificationViewState } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/buildClassificationViewState'
import { makeAccountCoverage as fixtureAccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/accountCoverage.mock'
import { makeDimensionCoverage as fixtureDimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/dimensionCoverage.mock'

import { ClassificationCoverageState } from './ClassificationCoverageState.state'

function renderClassificationState(state: ClassificationViewState) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <ClassificationCoverageState state={state} />
    </QueryClientProvider>,
  )
}

describe('ClassificationCoverageState', () => {
  it.each<[ClassificationViewState, string]>([
    [{ status: 'loading' }, 'Loading classification coverage…'],
    [{ status: 'empty' }, 'No classification coverage data available.'],
    [
      { status: 'not-applicable' },
      'Classification is not applicable to savings, checking and brokerage-cash accounts.',
    ],
  ])('renders the $status state message', (state, message) => {
    expect(renderClassificationState(state)).toContain(message)
  })

  it('renders the allocation coverage card when ready', () => {
    const html = renderClassificationState({
      status: 'ready',
      coverage: [fixtureAccountCoverage()],
      dimensionCoverage: [fixtureDimensionCoverage()],
    })

    expect(html).toContain('Portfolio scope')
    expect(html).toContain('Mapped positions')
    expect(html).not.toContain('No classification coverage data available.')
  })
})
