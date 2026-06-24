import { describe, it, expect } from 'vitest'
import { fmt, fmtDec, fmtEur, fmtFull, fmtPct, shortMonth } from './money'

describe('fmt', () => {
  it('is configured for EUR currency with no decimal places', () => {
    const opts = fmt.resolvedOptions()
    expect(opts.style).toBe('currency')
    expect(opts.currency).toBe('EUR')
    expect(opts.maximumFractionDigits).toBe(0)
  })
})

describe('fmtDec', () => {
  it('is configured for EUR currency with exactly 2 decimal places', () => {
    const opts = fmtDec.resolvedOptions()
    expect(opts.style).toBe('currency')
    expect(opts.currency).toBe('EUR')
    expect(opts.minimumFractionDigits).toBe(2)
    expect(opts.maximumFractionDigits).toBe(2)
  })
})

describe('fmtEur', () => {
  it('formats values under 1000 as whole euros', () => {
    expect(fmtEur(42)).toBe('42€')
    expect(fmtEur(0)).toBe('0€')
    expect(fmtEur(999)).toBe('999€')
  })

  it('formats values from 1000 as k€', () => {
    expect(fmtEur(1000)).toBe('1k€')
    expect(fmtEur(12_000)).toBe('12k€')
  })

  it('formats values from 1,000,000 as M€ with one decimal', () => {
    expect(fmtEur(2_500_000)).toBe('2.5M€')
  })

  it('keeps the sign for negative values while using the absolute value for the threshold', () => {
    expect(fmtEur(-1500)).toBe('-2k€')
  })
})

describe('fmtFull', () => {
  it('formats with thousands separators and a euro suffix, rounded to the nearest integer', () => {
    expect(fmtFull(1_234_567)).toBe('1,234,567 €')
    expect(fmtFull(10.6)).toBe('11 €')
  })
})

describe('fmtPct', () => {
  it('defaults to 1 decimal place with an explicit + sign for non-negative values', () => {
    expect(fmtPct(12.3)).toBe('+12.3%')
    expect(fmtPct(0)).toBe('+0.0%')
  })

  it('keeps the - sign for negative values without adding a +', () => {
    expect(fmtPct(-5.7)).toBe('-5.7%')
  })

  it('accepts a custom decimal precision', () => {
    expect(fmtPct(12.3, 2)).toBe('+12.30%')
  })
})

describe('shortMonth', () => {
  it('formats a date string as an abbreviated month and 2-digit year', () => {
    expect(shortMonth('2024-03-15')).toBe('Mar 24')
  })
})
