// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPerformanceDateRange } from './useFormatPerformanceDateRange'

afterEach(cleanup)

describe('useFormatPerformanceDateRange', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatPerformanceDateRange)
    expect(result.current(value, { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatPerformanceDateRange)
    expect(
      result.current({
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
      }),
    ).toBe('Jan 2026 – Jan 2026')
  })
})
