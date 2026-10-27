// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatMonthRange } from './useFormatMonthRange'

afterEach(cleanup)

describe('useFormatMonthRange', () => {
  it.each([
    { months: [], expected: '' },
    { months: null, expected: '' },
    { months: undefined, expected: '' },
    { months: ['2026-01'], expected: 'Jan 2026' },
    {
      months: ['2025-12', '2026-01', '2026-02'],
      expected: 'Dec 2025 – Feb 2026',
    },
  ])('formats $months as $expected', ({ months, expected }) => {
    const { result } = renderHook(useFormatMonthRange)
    expect(result.current(months)).toBe(expected)
  })

  it.each([null, undefined, []])(
    'allows a custom missing-range display for %s',
    (months) => {
      const { result } = renderHook(useFormatMonthRange)
      expect(result.current(months, { fallback: 'No period' })).toBe(
        'No period',
      )
    },
  )
})
