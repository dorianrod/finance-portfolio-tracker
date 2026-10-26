import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Badge,
  CountBadge,
  MetricDelta,
  SelectionCount,
} from '../../Badge.view'

const meta = {
  title: 'Badges/Badge',
  component: Badge,
  args: { tone: 'positive' },
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { tone: 'positive', children: 'Available' },
}
export const Tones: Story = {
  render: function Tones() {
    return (
      <div className="flex gap-3">
        <Badge tone="positive">
          Positive<Badge.Detail>detail</Badge.Detail>
        </Badge>
        <Badge tone="negative">Negative</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="accent">Accent</Badge>
      </div>
    )
  },
}
export const Counts: Story = {
  render: function Counts() {
    return (
      <div className="flex items-center gap-3">
        <CountBadge tone="negative" className="px-2 py-1">
          3
        </CountBadge>
        <CountBadge tone="warning" className="px-2 py-1">
          12
        </CountBadge>
        <SelectionCount className="px-2">5</SelectionCount>
      </div>
    )
  },
}
export const Deltas: Story = {
  render: function Deltas() {
    return (
      <div className="flex gap-3">
        <MetricDelta tone="positive">
          +12%<MetricDelta.Detail>this year</MetricDelta.Detail>
        </MetricDelta>
        <MetricDelta tone="negative" variant="inline">
          −4%
        </MetricDelta>
        <MetricDelta tone="muted">—</MetricDelta>
      </div>
    )
  },
}
