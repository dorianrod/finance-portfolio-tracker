// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'

import { useFormatOperationType } from './useFormatOperationType'

afterEach(cleanup)

describe('operation type labels', () => {
  it.each<{ operation: OperationType; expected: string }>([
    { operation: 'BUY', expected: 'Buy' },
    { operation: 'SELL', expected: 'Sell' },
    { operation: 'DIVIDEND', expected: 'Dividend' },
    { operation: 'INTEREST', expected: 'Interest' },
    { operation: 'DEPOSIT', expected: 'Deposit' },
    { operation: 'WITHDRAWAL', expected: 'Withdrawal' },
  ])('formats $operation', ({ operation, expected }) => {
    const { result } = renderHook(useFormatOperationType)
    expect(result.current(operation)).toBe(expected)
  })

  it.each([
    { operation: null, options: {}, expected: '—' },
    { operation: undefined, options: { fallback: '' }, expected: '' },
  ])(
    'formats missing operation as $expected',
    ({ operation, options, expected }) => {
      const { result } = renderHook(useFormatOperationType)
      expect(result.current(operation, options)).toBe(expected)
    },
  )
})
