// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPipelineErrorSource } from './useFormatPipelineErrorSource'

afterEach(cleanup)
describe('useFormatPipelineErrorSource', () => {
  it.each([
    ['main', 'ingest_portfolio.py'],
    ['fetch_prices', 'fetch_prices.py'],
    ['constructor', 'constructor'],
    ['__proto__', '__proto__'],
    ['new_source', 'new_source'],
  ])('formats %s as %s', (value, expected) => {
    const { result } = renderHook(() => useFormatPipelineErrorSource())
    expect(result.current(value)).toBe(expected)
  })
  it.each([null, undefined, ''])('owns fallback for %s', (value) => {
    const { result } = renderHook(() => useFormatPipelineErrorSource())
    expect(result.current(value)).toBe('—')
    expect(result.current(value, { fallback: '' })).toBe('')
  })
})
