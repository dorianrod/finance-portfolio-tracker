import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatDate } from './useFormatDate'

function DateFallbackProbe({
  value,
  options,
}: {
  value: Parameters<ReturnType<typeof useFormatDate>>[0]
  options?: Parameters<ReturnType<typeof useFormatDate>>[1]
}) {
  const formatDate = useFormatDate()
  return formatDate(value, options)
}

function DateProbe() {
  const formatDate = useFormatDate()
  return (
    <>
      {[
        formatDate('2024-03-15T00:00:00Z', {
          style: 'dayMonthYear',
          timeZone: 'UTC',
        }),
        formatDate('2024-03-15T00:00:00Z', {
          style: 'longMonthYear',
          timeZone: 'UTC',
        }),
        formatDate('2024-03-15T00:00:00Z', {
          style: 'shortMonthShortYear',
          timeZone: 'UTC',
        }),
      ].join('|')}
    </>
  )
}

describe('useFormatDate', () => {
  it.each([
    { value: null, expected: '—' },
    { value: undefined, expected: '—' },
    { value: null, options: { fallback: '' }, expected: '' },
    {
      value: undefined,
      options: { fallback: 'Unavailable' },
      expected: 'Unavailable',
    },
    { value: 'invalid', expected: '—' },
    { value: new Date(Number.NaN), options: { fallback: '' }, expected: '' },
    {
      value: 'invalid',
      options: { style: 'isoDate', fallback: 'Unavailable' },
      expected: 'Unavailable',
    },
    {
      value: 0,
      options: { style: 'isoDate', fallback: '' },
      expected: '1970-01-01',
    },
    {
      value: new Date('2024-03-15T00:00:00Z'),
      options: { style: 'isoDate', fallback: '' },
      expected: '2024-03-15',
    },
    {
      value: '2024-03-15T00:00:00Z',
      options: { style: 'longMonthYear', fallback: '' },
      expected: 'March 2024',
    },
  ] as const)(
    'formats $value with fallback options $options',
    ({ value, options, expected }) => {
      expect(
        renderToStaticMarkup(
          <DateFallbackProbe value={value} options={options} />,
        ),
      ).toBe(expected)
    },
  )

  it('formats date variants in the requested time zone', () => {
    expect(renderToStaticMarkup(<DateProbe />)).toBe(
      '15 Mar 2024|March 2024|Mar 24',
    )
  })
})
