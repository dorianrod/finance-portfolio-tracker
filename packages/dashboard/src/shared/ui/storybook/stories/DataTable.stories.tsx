import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataCell } from '@/shared/ui/dataTable/DataCell.view'

import { DATA_CELL_VARIANTS } from '../../dataTableAppearance'

const meta = { title: 'Tables/DataCell', component: DataCell } satisfies Meta<
  typeof DataCell
>
export default meta
type Story = StoryObj<typeof meta>

function VariantRow({ variant }: { variant: keyof typeof DATA_CELL_VARIANTS }) {
  return (
    <tr>
      <DataCell>{variant}</DataCell>
      <DataCell variant={variant}>12,450 €</DataCell>
    </tr>
  )
}
export const Variants: Story = {
  render: function Variants() {
    return (
      <table>
        <tbody>
          {Object.keys(DATA_CELL_VARIANTS).map((variant) => (
            <VariantRow
              key={variant}
              variant={variant as keyof typeof DATA_CELL_VARIANTS}
            />
          ))}
        </tbody>
      </table>
    )
  },
}
export const Tones: Story = {
  render: function Tones() {
    return (
      <table>
        <tbody>
          <tr>
            <DataCell tone="positive">+12%</DataCell>
            <DataCell tone="negative">−4%</DataCell>
            <DataCell tone="muted">—</DataCell>
          </tr>
        </tbody>
      </table>
    )
  },
}
