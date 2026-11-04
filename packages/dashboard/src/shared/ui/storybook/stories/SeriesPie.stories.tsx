import type { Meta, StoryObj } from '@storybook/react-vite'
import { PieChart } from 'recharts'
import { useArgs } from 'storybook/preview-api'

import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesPie } from '../../SeriesPie.view'
import { PieLabelExample, PieShapeExample } from '../ChartExamples.view'
import { ALLOCATION } from '../fixtures'

const meta = {
  title: 'Charts/Series/Pie',
  component: SeriesPie,
} satisfies Meta<typeof SeriesPie>
export default meta

type Args = Omit<React.ComponentProps<typeof SeriesPie>, 'className'> & {
  selectedName: string
}
export const Playground: StoryObj<Args> = {
  args: {
    data: ALLOCATION,
    dataKey: 'value',
    nameKey: 'name',
    outerRadius: 90,
    innerRadius: 0,
    interactive: true,
    labelConnector: true,
    motion: 'none',
    selectedName: 'Equity',
  },
  render: function Render(args) {
    const [{ selectedName }, updateArgs] = useArgs<Args>()
    return (
      <PieChart width={500} height={300}>
        <ChartTooltip />
        <SeriesPie
          {...args}
          onClick={(entry) => updateArgs({ selectedName: String(entry.name) })}
        >
          <SeriesPie.Shape>
            <PieShapeExample selectedName={selectedName} />
          </SeriesPie.Shape>
          <SeriesPie.Labels>
            <PieLabelExample />
          </SeriesPie.Labels>
        </SeriesPie>
      </PieChart>
    )
  },
}
export const Donut: StoryObj<Args> = {
  ...Playground,
  args: { ...Playground.args, innerRadius: 55 },
}
