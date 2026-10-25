import { describe, expect, it } from 'vitest'

import { normalizeAccountSelection } from './normalizeAccountSelection'

describe('normalizeAccountSelection', () => {
  it('deduplicates raw accounts and groups their cash rows', () => {
    expect(normalizeAccountSelection(['b::cash', 'a', 'b'])).toEqual(['a', 'b'])
  })
})
