import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataCell } from '../../DataTable.view'
import {
  LevelBadge,
  ReliabilityBadge,
  ScopeBadge,
  StatusTableRow,
} from '../../StatusBadge.view'

const meta = {
  title: 'Badges/Status',
  component: ReliabilityBadge,
  args: { tone: 'positive' },
} satisfies Meta<typeof ReliabilityBadge>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { tone: 'positive', children: 'Reliable' },
}
export const Reliability: Story = {
  render: function Reliability() {
    return (
      <div className="flex gap-3">
        <ReliabilityBadge tone="positive">Reliable</ReliabilityBadge>
        <ReliabilityBadge tone="warning">Partial</ReliabilityBadge>
        <ReliabilityBadge tone="negative">Unavailable</ReliabilityBadge>
      </div>
    )
  },
}
export const Scope: Story = {
  render: function Scope() {
    return (
      <div className="flex gap-3">
        <ScopeBadge tone="applied">Applied</ScopeBadge>
        <ScopeBadge tone="default">Default</ScopeBadge>
        <ScopeBadge tone="ignored">Ignored</ScopeBadge>
      </div>
    )
  },
}
export const Levels: Story = {
  render: function Levels() {
    return (
      <div className="flex gap-3">
        <LevelBadge level="error">Error</LevelBadge>
        <LevelBadge level="warning">Warning</LevelBadge>
        <LevelBadge level="muted">Information</LevelBadge>
      </div>
    )
  },
}
export const StatusRows: Story = {
  render: function Rows() {
    return (
      <table>
        <tbody>
          <StatusTableRow level="error">
            <DataCell>Missing value</DataCell>
            <DataCell>
              <LevelBadge level="error">Error</LevelBadge>
            </DataCell>
          </StatusTableRow>
          <StatusTableRow level="warning">
            <DataCell>Partial coverage</DataCell>
            <DataCell>
              <LevelBadge level="warning">Warning</LevelBadge>
            </DataCell>
          </StatusTableRow>
        </tbody>
      </table>
    )
  },
}
