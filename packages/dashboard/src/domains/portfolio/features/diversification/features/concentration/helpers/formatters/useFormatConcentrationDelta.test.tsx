// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatConcentrationDelta } from './useFormatConcentrationDelta'

afterEach(cleanup)

describe('useFormatConcentrationDelta', () => {
  it.each([
    { value: null, options: {}, expected: 'First comparable observation' },
    { value: 0, options: {}, expected: '0 positions vs previous month' },
    { value: -2, options: {}, expected: '-2 positions vs previous month' },
    {
      value: null,
      options: { fallback: 2 },
      expected: '+2 positions vs previous month',
    },
  ])('formats $value with $options', ({ value, options, expected }) => {
    const { result } = renderHook(useFormatConcentrationDelta)
    expect(result.current(value, options)).toBe(expected)
  })
  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatConcentrationDelta)
    expect(result.current(value, { fallback: '' })).toBe('')
  })
})
