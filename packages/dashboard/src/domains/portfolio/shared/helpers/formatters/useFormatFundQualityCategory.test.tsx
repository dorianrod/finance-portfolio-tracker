// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { FundQualityCategory } from '@/domains/portfolio/shared/types/fundQualityCategory.type'

import { useFormatFundQualityCategory } from './useFormatFundQualityCategory'

afterEach(cleanup)

describe('useFormatFundQualityCategory', () => {
  it.each<[FundQualityCategory, string]>([
    ['reliable', 'Reliable'],
    ['partial', 'Partial / estimated'],
    ['unavailable', 'Unavailable'],
  ])('formats %s as %s', (value, expected) => {
    const { result } = renderHook(useFormatFundQualityCategory)
    expect(result.current(value)).toBe(expected)
  })

  it.each([null, undefined])(
    'owns the missing-value fallback for %s',
    (value) => {
      const { result } = renderHook(useFormatFundQualityCategory)
      expect(result.current(value)).toBe('—')
      expect(result.current(value, { fallback: '' })).toBe('')
      expect(result.current(value, { fallback: 'Unknown' })).toBe('Unknown')
    },
  )
})
