import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatPositionCount } from './useFormatPositionCount'

function Probe({
  value,
  fallback,
}: {
  value: number | null | undefined
  fallback?: string | number
}) {
  return useFormatPositionCount()(value, { fallback })
}

describe('position count display', () => {
  it.each([
    [null, '—'],
    [undefined, '—'],
    [0, '0 positions'],
    [1, '1 position'],
    [2, '2 positions'],
    [1000, '1000 positions'],
  ] as const)(
    'formats %s without changing the zero or missing-value policy',
    (value, expected) => {
      expect(renderToStaticMarkup(<Probe value={value} />)).toBe(expected)
    },
  )

  it.each([
    { fallback: '', expected: '' },
    { fallback: 'No count', expected: 'No count' },
    { fallback: 0, expected: '0 positions' },
    { fallback: 1, expected: '1 position' },
  ])(
    'formats a missing count with fallback $fallback',
    ({ fallback, expected }) => {
      expect(
        renderToStaticMarkup(<Probe value={null} fallback={fallback} />),
      ).toBe(expected)
    },
  )
})
