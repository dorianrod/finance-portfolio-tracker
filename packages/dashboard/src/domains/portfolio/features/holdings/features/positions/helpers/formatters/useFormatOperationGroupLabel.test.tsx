// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { GroupRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { useFormatOperationGroupLabel } from './useFormatOperationGroupLabel'

afterEach(cleanup)
describe('useFormatOperationGroupLabel', () => {
  it.each<[GroupRow['groupType'], string]>([
    ['trades', 'Buys / Sells'],
    ['dividends', 'Dividends'],
    ['interest', 'Interest'],
    ['cash', 'Deposits / Withdrawals'],
  ])('formats %s', (group, expected) => {
    const { result } = renderHook(() => useFormatOperationGroupLabel())
    expect(result.current(group)).toBe(expected)
  })
  it('owns unknown-group fallback', () => {
    const { result } = renderHook(() => useFormatOperationGroupLabel())
    expect(result.current(null)).toBe('—')
    expect(result.current(undefined, { fallback: '' })).toBe('')
  })
})
