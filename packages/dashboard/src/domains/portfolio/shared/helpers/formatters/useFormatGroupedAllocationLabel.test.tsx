// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatGroupedAllocationLabel } from './useFormatGroupedAllocationLabel'

afterEach(cleanup)
describe('useFormatGroupedAllocationLabel', () => {
  it('formats aggregate counts and owns missing-value fallback', () => {
    const { result } = renderHook(() => useFormatGroupedAllocationLabel())
    expect(result.current(3)).toBe('others (3)')
    expect(result.current(null)).toBe('—')
    expect(result.current(undefined, { fallback: '' })).toBe('')
  })
})
