import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartMarker } from '../../ChartMarker.view'

const meta = {
  title: 'Charts/Shapes/ChartMarker',
  component: ChartMarker,
} satisfies Meta<typeof ChartMarker>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { cx: 30, cy: 30, tone: 'series1', outline: 'series1Stroke' },
  render: function Render(args) {
    return (
      <svg width="80" height="60">
        <ChartMarker {...args} />
      </svg>
    )
  },
}
export const Alternate: Story = {
  ...Playground,
  args: { ...Playground.args, tone: 'series7', outline: 'series7Stroke' },
}
export const Larger: Story = {
  ...Playground,
  args: {
    ...Playground.args,
    tone: 'series11',
    outline: 'series11Stroke',
    size: 'large',
  },
}
