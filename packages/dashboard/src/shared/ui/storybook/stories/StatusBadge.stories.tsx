import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataCell } from '@/shared/ui/dataTable/DataCell.view'
import { CompactBadge } from '@/shared/ui/statusBadge/CompactBadge.view'
import { LevelBadge } from '@/shared/ui/statusBadge/LevelBadge.view'
import { StatusBadge } from '@/shared/ui/statusBadge/StatusBadge.view'
import { StatusTableRow } from '@/shared/ui/statusBadge/StatusTableRow.view'

const meta = {
  title: 'Badges/Status',
  component: StatusBadge,
  args: { tone: 'positive' },
} satisfies Meta<typeof StatusBadge>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { tone: 'positive', children: 'Reliable' },
}
export const Reliability: Story = {
  render: function Reliability() {
    return (
      <div className="flex gap-3">
        <StatusBadge tone="positive">Reliable</StatusBadge>
        <StatusBadge tone="warning">Partial</StatusBadge>
        <StatusBadge tone="negative">Unavailable</StatusBadge>
      </div>
    )
  },
}
export const Scope: Story = {
  render: function Scope() {
    return (
      <div className="flex gap-3">
        <CompactBadge tone="accent">Applied</CompactBadge>
        <CompactBadge tone="default">Default</CompactBadge>
        <CompactBadge tone="warning">Ignored</CompactBadge>
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
