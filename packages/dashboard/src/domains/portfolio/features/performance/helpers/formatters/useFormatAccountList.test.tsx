// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatAccountList } from './useFormatAccountList'

afterEach(cleanup)

describe('useFormatAccountList', () => {
  it.each([null, undefined, []])('uses the fallback for %s', (accounts) => {
    const { result } = renderHook(useFormatAccountList)
    expect(result.current(accounts)).toBe('')
    expect(result.current(accounts, { fallback: 'Unavailable' })).toBe(
      'Unavailable',
    )
  })

  it('preserves account order and the compact separator', () => {
    const { result } = renderHook(useFormatAccountList)
    expect(result.current(['Brokerage', 'Savings'])).toBe('Brokerage, Savings')
  })
})
