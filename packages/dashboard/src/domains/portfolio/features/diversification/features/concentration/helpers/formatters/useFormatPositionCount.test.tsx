import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatPositionCount } from './useFormatPositionCount'

function Probe({ value }: { value: number | null }) {
  return useFormatPositionCount()(value)
}

describe('position count display', () => {
  it.each([
    [null, '—'],
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
})
