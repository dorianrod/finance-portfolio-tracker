import { useCallback } from 'react'

type DateStyle = 'dayMonthYear' | 'longDayMonthYear' | 'longMonthYear' | 'shortMonthYear' | 'shortMonthShortYear'

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  dayMonthYear: { day: 'numeric', month: 'short', year: 'numeric' },
  longDayMonthYear: { day: 'numeric', month: 'long', year: 'numeric' },
  longMonthYear: { month: 'long', year: 'numeric' },
  shortMonthYear: { month: 'short', year: 'numeric' },
  shortMonthShortYear: { month: 'short', year: '2-digit' },
}

interface DateFormatOptions {
  style?: DateStyle
  timeZone?: 'UTC'
}

const LOCAL_DATE_FORMATTERS = Object.fromEntries(
  Object.entries(DATE_OPTIONS).map(([style, options]) => [
    style,
    new Intl.DateTimeFormat('en-GB', options),
  ]),
) as Record<DateStyle, Intl.DateTimeFormat>

const UTC_DATE_FORMATTERS = Object.fromEntries(
  Object.entries(DATE_OPTIONS).map(([style, options]) => [
    style,
    new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }),
  ]),
) as Record<DateStyle, Intl.DateTimeFormat>

export function useFormatDate() {
  return useCallback((value: Date | number | string, options: DateFormatOptions = {}): string => {
    const { style = 'dayMonthYear', timeZone } = options
    const formatter = timeZone === 'UTC' ? UTC_DATE_FORMATTERS[style] : LOCAL_DATE_FORMATTERS[style]
    return formatter.format(value instanceof Date ? value : new Date(value))
  }, [])
}
