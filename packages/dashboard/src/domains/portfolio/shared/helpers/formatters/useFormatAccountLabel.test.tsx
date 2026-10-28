// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatAccountLabel } from './useFormatAccountLabel'

afterEach(cleanup)
describe('useFormatAccountLabel', () => {
  it('ignores inherited names and keeps the readable source-ID fallback', () => {
    const { result } = renderHook(() => useFormatAccountLabel())
    expect(result.current('constructor')).toBe('Constructor')
    expect(result.current('broker_one')).toBe('Broker One')
    expect(result.current('my_savings_account')).toBe('My Savings Account')
  })
  it('uses an explicit source label unchanged', () => {
    const { result } = renderHook(() => useFormatAccountLabel())
    expect(result.current('acc1', { labels: { acc1: 'Compte Bourse' } })).toBe(
      'Compte Bourse',
    )
    expect(
      result.current('broker_one', {
        labels: { broker_one: 'Broker One account' },
      }),
    ).toBe('Broker One account')
  })
  it.each([null, undefined, ''])('owns the fallback for %s', (account) => {
    const { result } = renderHook(() => useFormatAccountLabel())
    expect(result.current(account)).toBe('—')
    expect(result.current(account, { fallback: '' })).toBe('')
  })
})
