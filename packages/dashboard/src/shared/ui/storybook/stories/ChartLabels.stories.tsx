import type { Meta, StoryObj } from '@storybook/react-vite'

import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { ChartLabels } from '@/shared/ui/chartLabels/ChartLabels.view'
import { ChartLegend } from '@/shared/ui/chartLabels/ChartLegend.view'

import { SeriesBar } from '../../SeriesBar.view'
import { CartesianExample } from '../ChartExamples.view'
import type { HISTORY } from '../fixtures'

const meta = {
  title: 'Charts/Labels and legend',
  component: ChartLabels<(typeof HISTORY)[number]>,
} satisfies Meta<typeof ChartLabels<(typeof HISTORY)[number]>>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { position: 'top', density: 'compact', label: (point) => point.month },
  render: function Render(args) {
    const formatNumber = useFormatNumber()
    return (
      <CartesianExample>
        <ChartLegend />
        <SeriesBar
          dataKey="value"
          name="Example balance"
          tone={'series6'}
          motion="none"
        >
          <ChartLabels
            {...args}
            label={(point: (typeof HISTORY)[number]) =>
              formatNumber(point.value)
            }
          />
        </SeriesBar>
      </CartesianExample>
    )
  },
}
export const Standard: Story = {
  ...Playground,
  args: { ...Playground.args, density: 'standard' },
}
