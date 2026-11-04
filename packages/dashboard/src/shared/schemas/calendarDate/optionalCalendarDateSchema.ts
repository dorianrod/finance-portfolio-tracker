import { CALENDAR_DATE_SCHEMA } from './calendarDateSchema'

export const OPTIONAL_CALENDAR_DATE_SCHEMA =
  CALENDAR_DATE_SCHEMA.nullable().default(null)
