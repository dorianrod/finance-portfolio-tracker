// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { FundDiagnosticsFilter } from '@/domains/portfolio/features/data-quality/features/assessment/components/FundDataQualityPanel/helpers/transformers/buildFundDiagnosticsRows'

import { useFormatFundDiagnosticsFilter } from './useFormatFundDiagnosticsFilter'

afterEach(cleanup)

describe('useFormatFundDiagnosticsFilter', () => {
  it.each<[FundDiagnosticsFilter, string]>([
    ['all', 'All'],
    ['issues', 'Issues'],
    ['reliable', 'Reliable'],
    ['partial', 'Partial / estimated'],
    ['unavailable', 'Unavailable'],
  ])('formats %s as %s', (filter, expected) => {
    const { result } = renderHook(useFormatFundDiagnosticsFilter)
    expect(result.current(filter)).toBe(expected)
  })

  it.each([null, undefined])(
    'owns the missing filter fallback for %s',
    (filter) => {
      const { result } = renderHook(useFormatFundDiagnosticsFilter)
      expect(result.current(filter)).toBe('—')
      expect(result.current(filter, { fallback: '' })).toBe('')
    },
  )
})
