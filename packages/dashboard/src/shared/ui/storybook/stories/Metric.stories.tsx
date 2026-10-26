import type { Meta, StoryObj } from '@storybook/react-vite'

import { Inline } from '@/shared/ui/layout/Inline.view'

import { Metric } from '../../Metric.view'
import { Text } from '../../Text.view'

const meta = {
  title: 'Typography/Metric',
  component: Metric,
  args: { children: null },
} satisfies Meta<typeof Metric>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { tone: 'positive' },
  render: function Render(args) {
    return (
      <div className="w-64">
        <Metric {...args}>
          <Text variant="caption">Example balance</Text>
          <Inline as="div" align="center" gap="default">
            <Metric.Value>12,450 €</Metric.Value>
            <Metric.InlineNote tone="positive">+8%</Metric.InlineNote>
          </Inline>
          <Metric.Note>At the end of the period</Metric.Note>
        </Metric>
      </div>
    )
  },
}
export const MissingValue: Story = {
  render: function Missing() {
    return (
      <Metric>
        <Text variant="caption">Example balance</Text>
        <Metric.Value tone="muted">—</Metric.Value>
        <Metric.Note>No valuation available</Metric.Note>
      </Metric>
    )
  },
}
