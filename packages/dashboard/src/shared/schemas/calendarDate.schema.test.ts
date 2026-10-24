import { describe, expect, it } from 'vitest'

import {
  CALENDAR_DATE_SCHEMA,
  DATE_FILTER_SCHEMA,
  DATE_REQUEST_SCHEMA,
  OPTIONAL_CALENDAR_DATE_SCHEMA,
} from './calendarDate.schema'

describe('calendar dates at data boundaries', () => {
  it.each(['2024-02-29', '2026-10-24'])(
    'parses %s at midnight UTC',
    async (value) => {
      await expect(CALENDAR_DATE_SCHEMA.validate(value)).resolves.toEqual(
        new Date(`${value}T00:00:00Z`),
      )
    },
  )
  it('normalizes a month-scoped anomaly to its first calendar day', async () => {
    await expect(CALENDAR_DATE_SCHEMA.validate('2026-10')).resolves.toEqual(
      new Date('2026-10-01'),
    )
  })
  it.each(['2025-02-29', '2026-13-01', '2026-04-31', 'invalid'])(
    'rejects %s',
    async (value) => {
      await expect(CALENDAR_DATE_SCHEMA.validate(value)).rejects.toThrow()
    },
  )
  it.each(['', undefined, null])(
    'normalizes an absent optional date %s to null',
    async (value) => {
      await expect(
        OPTIONAL_CALENDAR_DATE_SCHEMA.validate(value),
      ).resolves.toBeNull()
    },
  )
  it('clears a date filter without storing a string and serializes requests as date-only', async () => {
    await expect(DATE_FILTER_SCHEMA.validate('')).resolves.toBeUndefined()
    await expect(
      DATE_REQUEST_SCHEMA.validate(new Date('2026-10-24')),
    ).resolves.toBe('2026-10-24')
  })
})
