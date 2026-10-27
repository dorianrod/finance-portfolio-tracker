// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatExactPerformanceDateRange } from './useFormatExactPerformanceDateRange'

afterEach(cleanup)

describe('useFormatExactPerformanceDateRange', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatExactPerformanceDateRange)
    expect(result.current(value, { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatExactPerformanceDateRange)
    expect(
      result.current({
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
      }),
    ).toBe('1 Jan 2026 – 31 Jan 2026')
  })
})
