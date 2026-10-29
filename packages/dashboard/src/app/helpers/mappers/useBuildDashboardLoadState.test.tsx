// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useBuildDashboardLoadState } from './useBuildDashboardLoadState'

afterEach(cleanup)

describe('dashboard loading precedence', () => {
  it.each([
    { queries: [], expected: { status: 'ready' } },
    { queries: [{ isPending: false, error: null }], expected: { status: 'ready' } },
    { queries: [{ isPending: true, error: null }], expected: { status: 'loading' } },
    {
      queries: [{ isPending: true, error: null }, { isPending: false, error: new Error('Server unavailable') }],
      expected: { status: 'error', message: 'Server unavailable' },
    },
  ])('resolves $expected.status', ({ queries, expected }) => {
    const { result } = renderHook(useBuildDashboardLoadState)
    expect(result.current(queries)).toEqual(expected)
  })
})
