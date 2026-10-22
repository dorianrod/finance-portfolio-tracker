import { describe, expect, it } from 'vitest'
import { assetDisplayLabel } from './assetLabel'

describe('assetDisplayLabel', () => {
  it('prefers the descriptive name over the ticker', () => {
    expect(assetDisplayLabel({
      name: 'Example Global Equity Fund',
      ticker: 'TST1',
    })).toBe('Example Global Equity Fund')
  })

  it('falls back consistently when the name is unavailable', () => {
    expect(assetDisplayLabel({ name: ' ', ticker: 'TST2' }, 'XX0000000001')).toBe('TST2')
    expect(assetDisplayLabel({ name: '', ticker: '' }, 'XX0000000001')).toBe('XX0000000001')
  })
})
