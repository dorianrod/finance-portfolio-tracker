import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartSector } from '../../ChartSector.view'

const meta = {
  title: 'Charts/Shapes/Sector',
  component: ChartSector,
} satisfies Meta<typeof ChartSector>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    cx: 110,
    cy: 110,
    innerRadius: 40,
    outerRadius: 90,
    startAngle: 10,
    endAngle: 150,
    category: 'Equity',
    selected: false,
    dimmed: false,
    variant: 'standard',
  },
  render: function Render(args) {
    return (
      <svg width="240" height="220">
        <ChartSector {...args} />
      </svg>
    )
  },
}
export const Selected: Story = {
  ...Playground,
  args: { ...Playground.args, selected: true },
}
export const Dimmed: Story = {
  ...Playground,
  args: { ...Playground.args, dimmed: true },
}
export const SplitBase: Story = {
  ...Playground,
  args: { ...Playground.args, variant: 'splitBase' },
}
export const SplitOverlay: Story = {
  ...Playground,
  args: { ...Playground.args, variant: 'splitOverlay' },
}
