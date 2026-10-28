// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatIrrPeriodLabel } from './useFormatIrrPeriodLabel'

afterEach(cleanup)
describe('useFormatIrrPeriodLabel', () => {
  it.each([
    [null, '3y'],
    [undefined, '3y'],
    [4, '3y'],
    [1.25, '1.2y'],
    [0.5, '6mo'],
    [0, '1mo'],
  ])('formats %s as %s', (years, expected) => {
    const { result } = renderHook(() => useFormatIrrPeriodLabel())
    expect(result.current(years)).toBe(expected)
  })
  it('allows an explicit fallback for an unknown period', () => {
    const { result } = renderHook(() => useFormatIrrPeriodLabel())
    expect(result.current(null, { fallback: '' })).toBe('')
  })
})
