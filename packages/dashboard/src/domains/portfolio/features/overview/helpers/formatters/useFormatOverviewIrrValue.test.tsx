// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatOverviewIrrValue } from './useFormatOverviewIrrValue'

afterEach(cleanup)

describe('useFormatOverviewIrrValue', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatOverviewIrrValue)
    expect(result.current(value, 'ready', { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatOverviewIrrValue)
    expect(result.current(0, 'ready')).toBe('+0.00%')
  })
})
