// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makeAccountSelection } from '@/domains/portfolio/features/scope-selection/mocks/accountSelection.mock'

import { useFormatAccountSelectionLabel } from './useFormatAccountSelectionLabel'

afterEach(cleanup)
describe('useFormatAccountSelectionLabel', () => {
  it('distinguishes all accounts, a partial group and a complete account type', () => {
    const { result } = renderHook(() => useFormatAccountSelectionLabel())
    expect(result.current(makeAccountSelection())).toBe('All accounts')
    expect(
      result.current(makeAccountSelection({ selected: new Set(['first']) })),
    ).toBe('First account')
    expect(
      result.current(
        makeAccountSelection({ selected: new Set(['first', 'second']) }),
      ),
    ).toBe('Brokerage')
  })
  it('summarizes more than two selected groups through a translated count', () => {
    const { result } = renderHook(() => useFormatAccountSelectionLabel())
    expect(
      result.current(
        makeAccountSelection({
          allAccountTypes: ['Brokerage', 'Savings', 'Pension'],
          allAccounts: ['first', 'second', 'third', 'fourth'],
          accountToType: {
            first: 'Brokerage',
            second: 'Brokerage',
            third: 'Savings',
            fourth: 'Pension',
          },
          selected: new Set(['first', 'second', 'third', 'fourth']),
        }),
      ),
    ).toBe('Brokerage, Savings +1')
  })
  it('owns missing input and configurable empty fallback', () => {
    const { result } = renderHook(() => useFormatAccountSelectionLabel())
    expect(result.current(null)).toBe('—')
    expect(result.current(undefined, { fallback: '' })).toBe('')
  })
})
