// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PieLabel } from './PieLabel.view'

afterEach(cleanup)

describe('PieLabel', () => {
  it.each([
    { cx: 100, cy: 100, midAngle: 0, x: '162', y: '94' },
    { cx: 0, cy: 0, midAngle: 0, x: '62', y: '-6' },
  ])('renders valid zero geometry: $cx, $cy, $midAngle', (geometry) => {
    render(
      <svg>
        <PieLabel
          {...geometry}
          outerRadius={40}
          name="Europe"
          value={100}
          percent={0.5}
        />
      </svg>,
    )
    const name = screen.getByText('Europe')
    expect(name.getAttribute('x')).toBe(geometry.x)
    expect(name.getAttribute('y')).toBe(geometry.y)
    expect(screen.getByText('100€ · 50.0%')).toBeTruthy()
  })

  it.each([
    { cx: undefined, cy: 100, midAngle: 0, percent: 0.5 },
    { cx: 100, cy: undefined, midAngle: 0, percent: 0.5 },
    { cx: 100, cy: 100, midAngle: undefined, percent: 0.5 },
    { cx: 100, cy: 100, midAngle: 0, percent: 0.02 },
  ])('omits labels with missing geometry or a small share: %o', (geometry) => {
    render(
      <svg>
        <PieLabel {...geometry} outerRadius={40} name="Europe" value={100} />
      </svg>,
    )
    expect(screen.queryByText('Europe')).toBeNull()
  })
})
