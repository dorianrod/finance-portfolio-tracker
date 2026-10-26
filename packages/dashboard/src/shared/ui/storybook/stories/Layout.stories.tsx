import type { Meta, StoryObj } from '@storybook/react-vite'

import { TableColumn } from '../../DataTable.view'
import { Grid, Inline, Inset, Layout, Stack } from '../../Layout.view'
import { PlotMarker, Proportion, TreeIndent } from '../../Proportion.view'
import { Surface } from '../../Surface.view'
import { ToneSwatch } from '../../Swatch.view'
import { Text } from '../../Text.view'
import { TreeConnector } from '../../TreeConnector.view'
import { VirtualCanvas } from '../../VirtualRow.view'

const meta = {
  title: 'Surfaces/Standard layout',
  component: Layout,
} satisfies Meta<typeof Layout>
export default meta
type Story = StoryObj<typeof meta>

export const Composition: Story = {
  render: function Composition() {
    return (
      <Stack>
        <Inline>
          <Text>Standard spacing</Text>
          <Text>Between elements</Text>
        </Inline>
        <Grid columns={2}>
          <Surface variant="card">
            <Inset inset="compact">
              <Text>Compact inset</Text>
            </Inset>
          </Surface>
          <Surface variant="card">
            <Text>Default card inset</Text>
          </Surface>
        </Grid>
        <Layout width="full" height="indicator" placement="inset">
          <Surface variant="annotatedTrack">
            <Proportion value={65}>
              <ToneSwatch as="div" tone="accent" />
            </Proportion>
            <PlotMarker value={40}>
              <ToneSwatch as="div" tone="secondary" />
            </PlotMarker>
          </Surface>
        </Layout>
        <TreeIndent depth={2}>
          <Text>Nested tree content</Text>
        </TreeIndent>
      </Stack>
    )
  },
}
export const DiagramAndVirtualCanvas: Story = {
  render: function DiagramAndVirtualCanvas() {
    return (
      <Stack>
        <Layout placement="inset" height="connector">
          <TreeConnector position="stem">
            <Surface variant="highlighted" />
          </TreeConnector>
          <TreeConnector position="pairBridge">
            <Surface variant="highlighted" />
          </TreeConnector>
          <TreeConnector position="pairLeft">
            <Surface variant="highlighted" />
          </TreeConnector>
          <TreeConnector position="pairRight">
            <Surface variant="highlighted" />
          </TreeConnector>
        </Layout>
        <VirtualCanvas height={40}>
          <Text>Measured canvas height</Text>
        </VirtualCanvas>
        <table>
          <colgroup>
            <TableColumn kind="label" />
            <TableColumn kind="value" />
          </colgroup>
          <tbody>
            <tr>
              <td>Label</td>
              <td>Value</td>
            </tr>
          </tbody>
        </table>
      </Stack>
    )
  },
}
