import type { Meta, StoryObj } from '@storybook/react-vite'

import { Layout } from '@/shared/ui/Layout.view'

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
        <CountBadge tone="negative">
          <Layout as="span" flow="inline" inset="compact">
            3
          </Layout>
        </CountBadge>
        <CountBadge tone="warning">
          <Layout as="span" flow="inline" inset="compact">
            12
          </Layout>
        </CountBadge>
        <SelectionCount>
          <Layout as="span" flow="inline" inset="compact">
            5
          </Layout>
        </SelectionCount>
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
