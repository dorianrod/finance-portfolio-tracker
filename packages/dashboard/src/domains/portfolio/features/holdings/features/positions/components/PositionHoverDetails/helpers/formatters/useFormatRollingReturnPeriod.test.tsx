// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatRollingReturnPeriod } from './useFormatRollingReturnPeriod'

afterEach(cleanup)

describe('useFormatRollingReturnPeriod', () => {
  it.each([
    ['six-months', '6m'],
    ['one-year', '1y'],
    ['since-start', 'Since start'],
    [null, '—'],
    [undefined, '—'],
  ] as const)('formats %s as %s', (period, expected) => {
    const { result } = renderHook(useFormatRollingReturnPeriod)
    expect(result.current(period)).toBe(expected)
  })

  it('preserves a caller-specified empty fallback', () => {
    const { result } = renderHook(useFormatRollingReturnPeriod)
    expect(result.current(null, { fallback: '' })).toBe('')
  })
})
