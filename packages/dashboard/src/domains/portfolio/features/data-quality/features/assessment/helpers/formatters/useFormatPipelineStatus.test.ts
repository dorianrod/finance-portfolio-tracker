// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPipelineStatus } from './useFormatPipelineStatus'

afterEach(cleanup)

describe('useFormatPipelineStatus', () => {
  it.each([
    { status: { errorCount: 0, warningCount: 0 }, expected: 'No anomaly' },
    { status: { errorCount: 0, warningCount: 2 }, expected: '2 anomalies' },
    { status: { errorCount: 1, warningCount: 0 }, expected: '1 anomaly' },
    { status: { errorCount: 2, warningCount: 3 }, expected: '5 anomalies' },
    {
      status: { errorCount: 2, warningCount: 3, loading: true },
      expected: 'Loading',
    },
    { status: null, expected: '—' },
    { status: undefined, expected: '—' },
  ])('formats $expected', ({ status, expected }) => {
    const { result } = renderHook(() => useFormatPipelineStatus())
    expect(result.current(status)).toBe(expected)
  })
  it('preserves an explicit empty fallback', () => {
    const { result } = renderHook(() => useFormatPipelineStatus())
    expect(result.current(null, { fallback: '' })).toBe('')
  })
})
