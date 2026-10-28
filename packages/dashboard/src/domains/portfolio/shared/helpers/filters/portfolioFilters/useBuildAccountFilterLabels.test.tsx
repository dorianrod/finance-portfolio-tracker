// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { useBuildAccountFilterLabels } from './useBuildAccountFilterLabels'

afterEach(cleanup)
describe('useBuildAccountFilterLabels', () => {
  it('keeps source labels, readable missing labels and separate brokerage cash labels', () => {
    const { result } = renderHook(() => useBuildAccountFilterLabels())
    const labels = { broker_one: 'Broker One account' }
    const positions = [
      makePosition({ id: 'investment', account: 'broker_one' }),
      makePosition({
        id: 'cash',
        account: 'broker_one',
        account_type: 'Bourse – Cash',
        name: 'Broker One cash',
      }),
      makePosition({ id: 'other', account: 'other_account' }),
    ]
    expect(result.current(positions, labels)).toEqual({
      broker_one: 'Broker One account',
      [`broker_one${CASH_ACCOUNT_FILTER_SUFFIX}`]: 'Broker One cash',
      other_account: 'Other Account',
    })
    expect(labels).toEqual({ broker_one: 'Broker One account' })
    expect(positions[1].account).toBe('broker_one')
  })
  it('stores inherited property names as literal account entries', () => {
    const { result } = renderHook(() => useBuildAccountFilterLabels())
    const labels = result.current(
      [
        makePosition({ id: 'proto', account: '__proto__' }),
        makePosition({ id: 'constructor', account: 'constructor' }),
      ],
      {},
    )
    expect(Object.hasOwn(labels, '__proto__')).toBe(true)
    expect(labels.constructor).toBe('Constructor')
    expect(typeof labels['__proto__']).toBe('string')
  })
  it('preserves source labels for an empty portfolio', () => {
    const { result } = renderHook(() => useBuildAccountFilterLabels())
    expect(result.current([], { archived: 'Archived account' })).toEqual({
      archived: 'Archived account',
    })
  })
})
