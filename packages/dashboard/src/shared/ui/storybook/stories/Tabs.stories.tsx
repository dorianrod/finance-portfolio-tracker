import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor } from 'storybook/test'

import { Tabs } from '../../Tabs.view'

const meta = { title: 'Navigation/Tabs', component: Tabs } satisfies Meta<
  typeof Tabs
>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { value: 'overview' },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<typeof args>()
    return (
      <Tabs
        {...args}
        value={value}
        onValueChange={(value) => updateArgs({ value })}
      >
        <Tabs.List label="Example views" className="flex gap-2">
          <Tabs.Trigger
            value="overview"
            variant="quality"
            selected={value === 'overview'}
            className="p-2"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="details"
            variant="quality"
            selected={value === 'details'}
            className="p-2"
          >
            Details
          </Tabs.Trigger>
          <Tabs.Trigger value="unavailable" disabled className="p-2">
            Unavailable
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview" className="p-4">
          Overview content
        </Tabs.Content>
        <Tabs.Content value="details" className="p-4">
          Detailed content
        </Tabs.Content>
      </Tabs>
    )
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Overview' }))
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    )
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Detailed content',
    )
  },
}
