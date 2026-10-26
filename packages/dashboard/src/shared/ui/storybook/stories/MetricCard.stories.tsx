import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { Button } from '../../Controls.view'
import { MetricCard } from '../../MetricCard.view'
import { Text } from '../../Text.view'

const meta = {
  title: 'Surfaces/MetricCard',
  component: MetricCard,
  args: { children: null },
} satisfies Meta<typeof MetricCard>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { accent: 'highlight', label: 'Open example balance', onOpen: fn() },
  render: function Render(args) {
    return (
      <div className="max-w-sm">
        <MetricCard {...args}>
          <MetricCard.Header>
            <Text variant="label">Example balance</Text>
            <MetricCard.Action>
              <Button
                label="More information"
                variant="quiet"
                onClick={args.onOpen}
              >
                ⓘ
              </Button>
            </MetricCard.Action>
          </MetricCard.Header>
          <MetricCard.Body>
            <Text variant="metric">12,450 €</Text>
          </MetricCard.Body>
        </MetricCard>
      </div>
    )
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open example balance' }),
    )
    await expect(args.onOpen).toHaveBeenCalledOnce()
  },
}
export const Positive: Story = {
  ...Playground,
  args: { ...Playground.args, accent: 'positive' },
}
export const Risk: Story = {
  ...Playground,
  args: { ...Playground.args, accent: 'attention' },
}
export const Accent: Story = {
  ...Playground,
  args: { ...Playground.args, accent: 'accent' },
}
