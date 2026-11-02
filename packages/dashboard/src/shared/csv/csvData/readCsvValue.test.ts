import { afterEach, describe, expect, it, vi } from 'vitest'
import { boolean, date, number, object, string } from 'yup'

import { readCsvValue } from './readCsvValue'

const ROW_SCHEMA = object({
  id: string().trim().required(),
  amount: number().positive().required(),
  date: date().required(),
  active: boolean().required(),
})
const row = {
  id: ' position-1 ',
  amount: '25.5',
  date: '2026-10-31T00:00:00Z',
  active: 'false',
  unexpected: 'removed',
}

afterEach(() => vi.unstubAllEnvs())

describe('readCsvValue', () => {
  it.each([undefined, 'true', 'false', '0', 'TRUE'])(
    'preserves conversion and strips unknown fields with DEBUG=%s',
    (setting) => {
      vi.stubEnv('DEBUG', setting)
      expect(readCsvValue(ROW_SCHEMA, row)).toEqual({
        id: 'position-1',
        amount: 25.5,
        date: new Date('2026-10-31'),
        active: false,
      })
    },
  )

  it.each([undefined, 'true', '0', 'FALSE'])(
    'enforces schema checks unless explicitly disabled (%s)',
    (setting) => {
      vi.stubEnv('DEBUG', setting)
      expect(() =>
        readCsvValue(ROW_SCHEMA, { ...row, amount: '-25.5' }),
      ).toThrow('amount must be a positive number')
    },
  )

  it('skips schema tests when validation is disabled', () => {
    vi.stubEnv('DEBUG', 'false')
    expect(readCsvValue(ROW_SCHEMA, { ...row, amount: '-25.5' })).toMatchObject(
      {
        amount: -25.5,
        date: new Date('2026-10-31'),
      },
    )
  })

  it('still rejects values that cannot be converted when validation is disabled', () => {
    vi.stubEnv('DEBUG', 'false')
    expect(() =>
      readCsvValue(ROW_SCHEMA, { ...row, amount: 'not-a-number' }),
    ).toThrow(TypeError)
  })
})
