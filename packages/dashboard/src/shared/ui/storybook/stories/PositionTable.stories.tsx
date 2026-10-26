import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataCell } from '../../DataTable.view'
import {
  PositionRowSurface,
  StripedRow,
  TransactionBadge,
} from '../../PositionTable.view'

const meta = {
  title: 'Tables/Position rows',
  component: PositionRowSurface,
} satisfies Meta<typeof PositionRowSurface>
export default meta
type Story = StoryObj<typeof meta>

export const Rows: Story = {
  args: { kind: 'position', closed: false },
  render: function Render(args) {
    return (
      <table className="w-full">
        <tbody>
          <PositionRowSurface {...args}>
            <DataCell>Configurable position row</DataCell>
            <DataCell>12,450 €</DataCell>
          </PositionRowSurface>
          <PositionRowSurface kind="group" closed={false}>
            <DataCell>Group row</DataCell>
            <DataCell>14,450 €</DataCell>
          </PositionRowSurface>
          <PositionRowSurface kind="detail" closed={false}>
            <DataCell>Detail row</DataCell>
            <DataCell>2,000 €</DataCell>
          </PositionRowSurface>
          <PositionRowSurface kind="position" closed>
            <DataCell>Closed position</DataCell>
            <DataCell>—</DataCell>
          </PositionRowSurface>
          <StripedRow shaded>
            <DataCell>Shaded row</DataCell>
            <DataCell>
              <TransactionBadge kind="buy">BUY</TransactionBadge>
            </DataCell>
          </StripedRow>
          <StripedRow shaded={false}>
            <DataCell>Unshaded row</DataCell>
            <DataCell>
              <TransactionBadge kind="sell">SELL</TransactionBadge>{' '}
              <TransactionBadge kind="other">OTHER</TransactionBadge>
            </DataCell>
          </StripedRow>
        </tbody>
      </table>
    )
  },
}
