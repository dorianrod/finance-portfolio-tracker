import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartLabel, ChartLeaderLine } from '../../ChartLabel.view'

const meta = {
  title: 'Charts/SVG labels',
  component: ChartLabel,
  args: { children: null },
} satisfies Meta<typeof ChartLabel>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    x: 80,
    y: 40,
    children: 'SVG label',
    variant: 'standard',
    tone: 'label',
    align: 'middle',
  },
  render: function Render(args) {
    return (
      <svg width="280" height="100">
        <ChartLeaderLine points="80,48 120,80 180,80" />
        <ChartLabel {...args} />
      </svg>
    )
  },
}
export const Compact: Story = {
  ...Playground,
  args: { ...Playground.args, variant: 'compact' },
}
export const AgeWeighted: Story = {
  ...Playground,
  args: {
    ...Playground.args,
    age: { year: 2022, recent: false, oldestYear: 2020, newestYear: 2025 },
  },
}
