// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPipelineErrorType } from './useFormatPipelineErrorType'

afterEach(cleanup)
describe('useFormatPipelineErrorType', () => {
  it.each([
    ['missing_price', 'Missing price'],
    ['parsing_error', 'Parsing error'],
    ['constructor', 'constructor'],
    ['__proto__', '__proto__'],
    ['new_source_error', 'new_source_error'],
  ])('formats %s as %s', (value, expected) => {
    const { result } = renderHook(() => useFormatPipelineErrorType())
    expect(result.current(value)).toBe(expected)
  })
  it.each([null, undefined, ''])('owns fallback for %s', (value) => {
    const { result } = renderHook(() => useFormatPipelineErrorType())
    expect(result.current(value)).toBe('—')
    expect(result.current(value, { fallback: '' })).toBe('')
  })
})
