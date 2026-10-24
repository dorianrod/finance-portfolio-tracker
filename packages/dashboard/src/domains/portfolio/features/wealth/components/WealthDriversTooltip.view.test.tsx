import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import '@/i18n/i18n'
import { DriversTooltip } from './WealthDriversTooltip.view'

const point = {
  date: new Date('2026-09-30T00:00:00Z'),
  savings_delta: 100,
  perf_delta: 20,
  cumulative_savings: 100,
  cumulative_performance: 20,
  cumulative_change: 120,
}

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
