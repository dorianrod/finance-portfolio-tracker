import { describe, expect, it } from 'vitest'

import { isFundPosition } from './isFundPosition'

describe('isFundPosition', () => {
  it.each([
    'Example UCITS ETF',
    'Example FCP',
    'FCPE Employee Savings',
    'Example SICAV',
    'Example OPCVM',
    'Example PEE',
    'PEI Savings',
    'PERCO Investments',
    'Example Private Equity',
    'Assurance Vie Example',
    'Example Life Insurance',
    'Example SCPI',
    'OPCI Property',
    'Fonds Example',
    'Amundi World',
    'BNP Paribas Easy Europe',
    'Global X Growth',
    'iShares World',
    'L&G Europe',
    'Xtrackers World',
    'DWS Europe',
    'SPDR World',
    'Vanguard Growth',
    'Invesco Europe',
    'UBS Index',
    'HSBC World',
    'Legal & General Growth',
  ])('recognizes the pipeline fund category: %s', (name) => {
    expect(isFundPosition({ name })).toBe(true)
  })

  it.each(['Example Corp', 'Fundamental Research Inc', 'Fundraiser Ltd', ''])(
    'keeps ordinary source names outside the fund classification: %s',
    (name) => {
      expect(isFundPosition({ name })).toBe(false)
    },
  )
})
