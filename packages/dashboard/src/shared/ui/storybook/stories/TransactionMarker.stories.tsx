import type { Meta, StoryObj } from '@storybook/react-vite'

import { TransactionMarker } from '../../TransactionMarker.view'

const meta = {
  title: 'Charts/Shapes/TransactionMarker',
  component: TransactionMarker,
} satisfies Meta<typeof TransactionMarker>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { cx: 30, cy: 30, kind: 'buy' },
  render: function Render(args) {
    return (
      <svg width="80" height="60">
        <TransactionMarker {...args} />
      </svg>
    )
  },
}
export const Sell: Story = {
  ...Playground,
  args: { ...Playground.args, kind: 'sell' },
}
export const Mixed: Story = {
  ...Playground,
  args: { ...Playground.args, kind: 'mixed' },
}
