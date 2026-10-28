// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { afterEach, describe, expect, it } from 'vitest'

import { assetIrr } from '@/domains/portfolio/features/performance/mocks/assetIrrSummary.mock'
import { summary } from '@/domains/portfolio/features/performance/mocks/rankedContributionSummary.mock'

import { PerformanceContributionCard } from './PerformanceContributionCard.feature'

afterEach(cleanup)

describe('PerformanceContributionCard', () => {
  it('switches horizons and metrics without losing the selected contribution horizon', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PerformanceContributionCard
          assetIrr={assetIrr()}
          assetIrrStatus="ready"
          sinceTracking={summary()}
          trailingThreeYears={summary({
            horizon: 'trailing-3y',
            startDate: new Date('2023-09-30'),
          })}
          sinceTrackingIrr={12.34}
          trailingThreeYearIrr={8.5}
          irrStatus="ready"
        />
      </Provider>,
    )
    expect(
      screen.getByRole('heading', { name: 'Performance by asset', level: 2 }),
    ).toBeDefined()
    expect(
      screen.getByRole('heading', { name: /^Top contributors/ }),
    ).toBeDefined()
    expect(
      screen.getByRole('heading', { name: /^Main detractors/ }),
    ).toBeDefined()
    expect(
      screen.getAllByRole('button', { name: 'More information' }),
    ).toHaveLength(4)
    expect(screen.getByText('+12.34%')).toBeDefined()
    expect(screen.getByText('Attributed net performance')).toBeDefined()
    expect(screen.getByText('AAA')).toBeDefined()
    expect(screen.getByText('BBB')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Trailing 3 years' }))
    expect(screen.getByText('+8.50%')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'IRR %' }))
    expect(screen.getByRole('heading', { name: 'Top IRRs' })).toBeDefined()
    expect(screen.getByText('Winner')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Contribution €' }))
    expect(screen.getByText('+8.50%')).toBeDefined()
  })

  it('disables the trailing horizon when three years are unavailable', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PerformanceContributionCard
          assetIrr={assetIrr()}
          assetIrrStatus="ready"
          sinceTracking={summary()}
          trailingThreeYears={summary({
            horizon: 'trailing-3y',
            available: false,
          })}
          sinceTrackingIrr={12.34}
          trailingThreeYearIrr={null}
          irrStatus="ready"
        />
      </Provider>,
    )
    const trailing = screen.getByRole('button', { name: 'Trailing 3 years' })
    expect(trailing).toHaveProperty('disabled', true)
    expect(trailing.getAttribute('title')).toBe(
      'Three years of history are not yet available',
    )
    await user.click(trailing)
    expect(screen.getByText('+12.34%')).toBeDefined()
  })

  it.each([
    { status: 'loading', expected: 'Calculating…' },
    { status: 'error', expected: 'Unavailable' },
  ] as const)(
    'keeps contributions visible during IRR $status',
    ({ status, expected }) => {
      render(
        <Provider>
          <PerformanceContributionCard
            assetIrr={assetIrr()}
            assetIrrStatus="ready"
            sinceTracking={summary()}
            trailingThreeYears={summary({ horizon: 'trailing-3y' })}
            sinceTrackingIrr={null}
            trailingThreeYearIrr={8.5}
            irrStatus={status}
          />
        </Provider>,
      )
      expect(screen.getByText(expected)).toBeDefined()
      expect(screen.getByText('AAA')).toBeDefined()
    },
  )
})
