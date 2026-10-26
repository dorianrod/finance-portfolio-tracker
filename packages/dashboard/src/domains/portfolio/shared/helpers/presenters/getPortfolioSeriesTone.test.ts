import { describe, expect, it } from 'vitest'

import { getAccountTypeTone } from '@/domains/portfolio/features/wealth/helpers/presenters/getAccountTypeTone'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'

describe('getAllocationTone', () => {
  it('assigns fixed colors to nc, Not concerned, and autre/others categories', () => {
    expect(CHART_COLORS[getAllocationTone('nc')]).toBe('#374151')
    expect(CHART_COLORS[getAllocationTone('Not concerned')]).toBe('#94a3b8')
    expect(CHART_COLORS[getAllocationTone('autre')]).toBe('#6b7280')
    expect(CHART_COLORS[getAllocationTone('Autre')]).toBe('#6b7280')
    expect(CHART_COLORS[getAllocationTone('others (3)')]).toBe('#6b7280')
  })

  it('uses the known category palette for well-known geography/sector/class names', () => {
    expect(CHART_COLORS[getAllocationTone('france')]).toBe('#3b82f6')
    expect(CHART_COLORS[getAllocationTone('actions')]).toBe('#3b82f6')
    expect(CHART_COLORS[getAllocationTone('tech')]).toBe('#3b82f6')
  })

  it('deterministically hashes unknown category names to a stable palette color', () => {
    const a = CHART_COLORS[getAllocationTone('some unknown category')]
    const b = CHART_COLORS[getAllocationTone('some unknown category')]
    expect(a).toBe(b)
    expect(a).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('getAccountTypeTone', () => {
  it('colors an account type by its category when known', () => {
    expect(
      CHART_COLORS[getAccountTypeTone('PEA', 0, { PEA: 'brokerage' })],
    ).toBe('#3b82f6')
    expect(
      CHART_COLORS[getAccountTypeTone('Livret', 0, { Livret: 'savings' })],
    ).toBe('#06b6d4')
  })

  it('falls back to a rotating fallback palette by index when the category is unknown', () => {
    expect(CHART_COLORS[getAccountTypeTone('Unknown', 0, {})]).toBe('#ec4899')
    expect(CHART_COLORS[getAccountTypeTone('Unknown', 1, {})]).toBe('#14b8a6')
    expect(CHART_COLORS[getAccountTypeTone('Unknown', 4, {})]).toBe('#ec4899')
  })
})
