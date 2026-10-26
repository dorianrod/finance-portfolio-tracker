import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Layout } from '@/shared/ui/Layout.view'

import { ColHeader } from '../../ColHeader.view'
import { Button } from '../../Controls.view'
import { DataCell } from '../../DataTable.view'
import { TablePanel } from '../../TablePanel.view'

const meta = {
  title: 'Tables/TablePanel',
  component: TablePanel,
} satisfies Meta<typeof TablePanel>
export default meta
type Story = StoryObj<typeof meta>

function TableExample() {
  const [expanded, setExpanded] = useState(false)
  return (
    <TablePanel>
      <TablePanel.Toolbar>
        <div>
          <TablePanel.Title>Example positions</TablePanel.Title>
          <TablePanel.Description>
            Fictional values for component documentation
          </TablePanel.Description>
        </div>
        <TablePanel.Actions>
          <Button
            variant="secondary"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show fewer' : 'Show all'}
          </Button>
        </TablePanel.Actions>
      </TablePanel.Toolbar>
      <Layout as="table" width="full">
        <TablePanel.Header>
          <tr>
            <th>
              <ColHeader label="Name" content="Name of the fictional holding" />
            </th>
            <th>Value</th>
          </tr>
        </TablePanel.Header>
        <tbody>
          <tr>
            <DataCell>Example fund</DataCell>
            <DataCell align="right" numeric>
              12,450 €
            </DataCell>
          </tr>
          {expanded && (
            <tr>
              <DataCell>Example reserve</DataCell>
              <DataCell align="right" numeric>
                2,000 €
              </DataCell>
            </tr>
          )}
        </tbody>
      </Layout>
    </TablePanel>
  )
}
export const Complete: Story = { render: TableExample }
