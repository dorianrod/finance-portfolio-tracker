import { CALENDAR_DATE_SCHEMA } from './calendarDateSchema'

export const DATE_FILTER_SCHEMA = CALENDAR_DATE_SCHEMA.transform(
  (value: Date | null) => value ?? undefined,
).optional()
