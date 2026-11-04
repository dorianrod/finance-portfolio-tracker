import { describe, expect, it } from 'vitest'

import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'

import { getAllocationTone } from './getAllocationTone'

describe('getAllocationTone', () => {
  it.each([
    'constructor',
    '__proto__',
    'toString',
    'others (3)',
    'others (custom)',
  ])('uses a real palette fallback for %s', (category) => {
    expect(getAllocationTone(category)).toBe(getHashedSeriesTone(category))
  })
  it.each([
    ['actions', 'series1'],
    ['france', 'series1'],
    ['tech', 'series1'],
    ['nc', 'subtle'],
    ['Not concerned', 'muted'],
    ['autre', 'dim'],
    ['Autre', 'dim'],
  ])('assigns the semantic tone for %s', (category, expected) => {
    expect(getAllocationTone(category)).toBe(expected)
  })
})
