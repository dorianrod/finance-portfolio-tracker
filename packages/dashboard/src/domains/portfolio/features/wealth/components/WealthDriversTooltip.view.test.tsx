import '@/i18n/i18n'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { makeWealthDriverPoint } from '@/domains/portfolio/features/wealth/mocks/wealthDriverPoint.mock'

import { DriversTooltip } from './WealthDriversTooltip.view'

const point = makeWealthDriverPoint()

describe('DriversTooltip', () => {
  it.each([point.date, point.date.getTime(), '2026-09-30'])(
    'formats a chart date label %s',
    (label) => {
      const html = renderToStaticMarkup(
        <DriversTooltip active payload={[{ payload: point }]} label={label} />,
      )
      expect(html).toContain('Sept 2026')
      expect(html).toContain('Net contributions')
    },
  )
})
