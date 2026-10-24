import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatDate } from './useFormatDate'

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
  it('formats date variants in the requested time zone', () => {
    expect(renderToStaticMarkup(<DateProbe />)).toBe(
      '15 Mar 2024|March 2024|Mar 24',
    )
  })
})
