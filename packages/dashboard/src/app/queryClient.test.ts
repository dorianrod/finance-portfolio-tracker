import { describe, expect, it } from 'vitest'
import { queryClient } from './queryClient'

describe('queryClient', () => {
  it('keeps generated portfolio data stable and avoids focus refetches', () => {
    const options = queryClient.getDefaultOptions().queries

    expect(options?.staleTime).toBe(Number.POSITIVE_INFINITY)
    expect(options?.refetchOnWindowFocus).toBe(false)
    expect(options?.retry).toBe(1)
  })
})
