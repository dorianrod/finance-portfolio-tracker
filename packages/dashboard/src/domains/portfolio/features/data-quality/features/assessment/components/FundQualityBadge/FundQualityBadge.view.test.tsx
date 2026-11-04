// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'

import { FundQualityBadge } from './FundQualityBadge.view'

afterEach(cleanup)

describe('FundQualityBadge', () => {
  it.each([
    {
      holdingsDate: new Date('2026-09-30T00:00:00Z'),
      expectedDate: 'Composition dated 30 Sept 2026',
    },
    { holdingsDate: null, expectedDate: 'Composition date unknown' },
  ])(
    'formats composition metadata as $expectedDate',
    ({ holdingsDate, expectedDate }) => {
      render(
        <FundQualityBadge status={makeFundHoldingStatus({ holdingsDate })} />,
      )

      expect(screen.getByText('Reliable').getAttribute('title')).toBe(
        `Reliable: Source officielle · Official source · 90.0 % explained · ${expectedDate}`,
      )
    },
  )
})
