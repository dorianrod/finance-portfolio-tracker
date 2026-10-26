import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataCell } from '../../DataTable.view'
import { InlineBadge, StripedRow, TableRowSurface } from '../../TableRow.view'

const meta = {
  title: 'Tables/Table rows',
  component: TableRowSurface,
} satisfies Meta<typeof TableRowSurface>
export default meta
type Story = StoryObj<typeof meta>

export const Rows: Story = {
  args: { variant: 'interactive', dimmed: false },
  render: function Render(args) {
    return (
      <table className="w-full">
        <tbody>
          <TableRowSurface {...args}>
            <DataCell>Configurable row</DataCell>
            <DataCell>12,450 €</DataCell>
          </TableRowSurface>
          <TableRowSurface variant="raised">
            <DataCell>Group row</DataCell>
            <DataCell>14,450 €</DataCell>
          </TableRowSurface>
          <TableRowSurface variant="detail">
            <DataCell>Detail row</DataCell>
            <DataCell>2,000 €</DataCell>
          </TableRowSurface>
          <TableRowSurface variant="interactive" dimmed>
            <DataCell>Dimmed row</DataCell>
            <DataCell>—</DataCell>
          </TableRowSurface>
          <StripedRow shaded>
            <DataCell>Shaded row</DataCell>
            <DataCell>
              <InlineBadge tone="accent">BUY</InlineBadge>
            </DataCell>
          </StripedRow>
          <StripedRow shaded={false}>
            <DataCell>Unshaded row</DataCell>
            <DataCell>
              <InlineBadge tone="attention">SELL</InlineBadge>{' '}
              <InlineBadge tone="decorative">OTHER</InlineBadge>
            </DataCell>
          </StripedRow>
        </tbody>
      </table>
    )
  },
}
