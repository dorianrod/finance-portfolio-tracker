import { describe, expect, it } from 'vitest'
import { tooltipValue } from './chartTooltip'

describe('tooltipValue', () => {
  it('returns the numeric value matching a data key', () => {
    const payload = [
      { dataKey: 'cost', value: 120 },
      { dataKey: 'value', value: 150 },
    ]

    expect(tooltipValue(payload, 'value')).toBe(150)
    expect(tooltipValue(payload, 'missing')).toBe(0)
  })
})
