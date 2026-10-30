import { DAY_MS } from './dayMs'

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}
