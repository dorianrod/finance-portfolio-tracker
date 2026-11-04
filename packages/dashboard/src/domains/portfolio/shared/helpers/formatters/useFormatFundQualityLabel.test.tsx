// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

import { useFormatFundQualityLabel } from './useFormatFundQualityLabel'

afterEach(cleanup)

describe('useFormatFundQualityLabel', () => {
  it.each<[FundQualityTier, string]>([
    ['A', 'Reliable'],
    ['B', 'Reliable'],
    ['C', 'Partial / estimated'],
    ['D', 'Unavailable'],
  ])('formats %s as %s', (value, expected) => {
    const { result } = renderHook(useFormatFundQualityLabel)
    expect(result.current(value)).toBe(expected)
  })

  it.each([null, undefined])(
    'owns the missing-value fallback for %s',
    (value) => {
      const { result } = renderHook(useFormatFundQualityLabel)
      expect(result.current(value)).toBe('—')
      expect(result.current(value, { fallback: '' })).toBe('')
      expect(result.current(value, { fallback: 'Unknown' })).toBe('Unknown')
    },
  )
})
