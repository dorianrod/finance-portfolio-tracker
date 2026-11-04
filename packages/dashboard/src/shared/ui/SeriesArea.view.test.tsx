// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AreaChart, Tooltip } from 'recharts'
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest'

import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLegend } from '@/shared/ui/chartLabels/ChartLegend.view'
import type { NumericTooltipProps } from '@/shared/ui/chartTooltip'

import { SeriesArea } from './SeriesArea.view'
import { SeriesGradient } from './SeriesGradient.view'

afterEach(cleanup)

type RecordPoint = { name: string; values: Record<string, number> }

describe('SeriesArea', () => {
  it('registers the named series and renders its data categories', async () => {
    render(
      <AreaChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', value: 10 },
          { name: 'Beta', value: 20 },
        ]}
      >
        <defs>
          <SeriesGradient
            id="cost-gradient"
            tone={'secondary'}
            profile="base"
          />
        </defs>
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <ChartLegend />
        <SeriesArea
          name="Portfolio value"
          dataKey="value"
          tone={'secondary'}
          gradientId="cost-gradient"
          weight="fine"
        />
      </AreaChart>,
    )
    expect(await screen.findByText('Portfolio value')).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('renders supplied palette roles with the requested gradient profiles', () => {
    const category = renderToStaticMarkup(
      <svg>
        <defs>
          <SeriesGradient id="category" tone="series1" profile="dense" />
        </defs>
      </svg>,
    )
    const grouped = renderToStaticMarkup(
      <svg>
        <defs>
          <SeriesGradient id="group" tone="series1" />
        </defs>
      </svg>,
    )
    expect(category).toContain('stop-color="#3b82f6"')
    expect(category).toContain('stop-opacity="0.8"')
    expect(grouped).toContain('stop-color="#3b82f6"')
  })

  it('reads literal record keys through a typed accessor during keyboard exploration', async () => {
    expectTypeOf<
      ComponentProps<typeof SeriesArea<RecordPoint>>['dataKey']
    >().toEqualTypeOf<keyof RecordPoint | ((point: RecordPoint) => unknown)>()
    const user = userEvent.setup()
    render(
      <AreaChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', values: { 'revenue.total': 10 } },
          { name: 'Beta', values: { 'revenue.total': 20 } },
        ]}
      >
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <Tooltip content={<RevenueTooltip />} />
        <SeriesArea
          dataKey={(point: RecordPoint) => point.values['revenue.total']}
          tone="series1"
        />
      </AreaChart>,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByLabelText('Revenue')).toHaveProperty('textContent', '20')
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByLabelText('Revenue')).toHaveProperty('textContent', '10')
  })
})

function RevenueTooltip({ active, payload }: NumericTooltipProps<RecordPoint>) {
  if (!active) return null
  return <output aria-label="Revenue">{payload?.[0]?.value}</output>
}
