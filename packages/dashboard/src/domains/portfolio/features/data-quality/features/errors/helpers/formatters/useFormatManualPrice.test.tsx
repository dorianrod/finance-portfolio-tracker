// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatManualPrice } from './useFormatManualPrice'

afterEach(cleanup)

describe('useFormatManualPrice', () => {
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatManualPrice)
    expect(result.current(value, { fallback: '' })).toBe('')
  })
})
