// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPerformanceIrrLabel } from './useFormatPerformanceIrrLabel'

afterEach(cleanup)

describe('useFormatPerformanceIrrLabel', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatPerformanceIrrLabel)
    expect(result.current(value, 'ready', { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatPerformanceIrrLabel)
    expect(result.current(0, 'ready')).toBe('+0.00%')
  })
})
