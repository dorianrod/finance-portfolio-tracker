import type { Meta, StoryObj } from '@storybook/react-vite'

import { Layout } from '@/shared/ui/Layout.view'

import { Surface } from '../../Surface.view'
import { VirtualRow } from '../../VirtualRow.view'

const meta = {
  title: 'Tables/VirtualRow',
  component: VirtualRow,
} satisfies Meta<typeof VirtualRow>
export default meta
type Story = StoryObj<typeof meta>

export const Positioned: Story = {
  args: {
    height: 48,
    offset: 64,
    children: 'Virtual row at a configurable offset',
  },
  render: function Render(args) {
    return (
      <div className="relative h-64">
        <VirtualRow {...args}>
          <Layout height="full">
            <Surface variant="card">{args.children}</Surface>
          </Layout>
        </VirtualRow>
      </div>
    )
  },
}
