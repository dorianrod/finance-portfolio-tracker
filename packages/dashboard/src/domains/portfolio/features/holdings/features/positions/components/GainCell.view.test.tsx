// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GainCell } from './GainCell.view'

afterEach(cleanup)

describe('GainCell', () => {
  it.each([
    { value: null, expected: '—' },
    { value: 0, expected: '€0' },
    { value: 0, zeroAsFallback: true, expected: '—' },
    { value: -12, zeroAsFallback: true, expected: '-€12' },
    { value: 12, zeroAsFallback: true, expected: '€12' },
  ])('displays $value with zeroAsFallback=$zeroAsFallback', (props) => {
    render(<GainCell {...props} />)
    expect(screen.getByText(props.expected)).toBeTruthy()
  })

  it.each([null, 0])('omits the percentage for a missing gain: %s', (value) => {
    render(<GainCell value={value} pct={12} zeroAsFallback />)
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.queryByText('+12.00%')).toBeNull()
  })

  it('keeps the percentage for a real zero gain', () => {
    render(<GainCell value={0} pct={0} />)
    expect(screen.getByText('+0.00%')).toBeTruthy()
  })
})
