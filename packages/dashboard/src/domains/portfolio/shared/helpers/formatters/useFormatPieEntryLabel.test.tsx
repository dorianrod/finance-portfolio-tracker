// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPieEntryLabel } from './useFormatPieEntryLabel'

afterEach(cleanup)
describe('useFormatPieEntryLabel', () => {
  it('formats a synthetic aggregate independently of its name', () => {
    const { result } = renderHook(() => useFormatPieEntryLabel())
    expect(
      result.current({
        name: '',
        subItems: [
          { name: 'Energy', value: 3 },
          { name: 'Health', value: 2 },
        ],
      }),
    ).toBe('others (2)')
    expect(result.current({ name: 'others (2)' })).toBe('others (2)')
  })
  it.each([null, undefined, { name: '' }])(
    'owns missing label fallbacks for %s',
    (entry) => {
      const { result } = renderHook(() => useFormatPieEntryLabel())
      expect(result.current(entry)).toBe('—')
      expect(result.current(entry, { fallback: '' })).toBe('')
    },
  )
})
