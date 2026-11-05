// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makeFundHolding } from '@/domains/portfolio/shared/mocks/fundHolding.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { FundPositionHoldingRow } from './FundPositionHoldingRow.feature'

afterEach(cleanup)

describe('FundPositionHoldingRow', () => {
  it.each<[number | null, string]>([
    [null, '—'],
    [0, '0 €'],
    [1000, '250 €'],
  ])('displays exposure for a position valued at %s', (value, expected) => {
    const holding = makeFundHolding({ weight: 0.25 })
    const position = makePosition({ total_value: value })

    render(<FundPositionHoldingRow holding={holding} position={position} />)

    expect(screen.getByText(holding.holdingName)).toBeTruthy()
    expect(screen.getByText('25.00%')).toBeTruthy()
    expect(screen.getByText(expected)).toBeTruthy()
  })
})
