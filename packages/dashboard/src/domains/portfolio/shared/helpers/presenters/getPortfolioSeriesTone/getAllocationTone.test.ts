import { describe, expect, it } from 'vitest'

import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'

import { getAllocationTone } from './getAllocationTone'

describe('getAllocationTone', () => {
  it.each(['constructor', '__proto__', 'toString'])(
    'uses a real palette fallback for %s',
    (category) => {
      expect(getAllocationTone(category)).toBe(getHashedSeriesTone(category))
    },
  )
  it('preserves existing semantic palette entries', () => {
    expect(getAllocationTone('actions')).toBe('series1')
    expect(getAllocationTone('nc')).toBe('subtle')
    expect(getAllocationTone('Not concerned')).toBe('muted')
  })
})
