// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPerformanceAsOfDate } from './useFormatPerformanceAsOfDate'

afterEach(cleanup)

describe('useFormatPerformanceAsOfDate', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatPerformanceAsOfDate)
    expect(result.current(value, { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatPerformanceAsOfDate)
    expect(result.current(new Date('2026-01-31'))).toBe('31 Jan 2026')
  })
})
