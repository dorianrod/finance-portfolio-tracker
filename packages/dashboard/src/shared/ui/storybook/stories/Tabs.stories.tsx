import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor } from 'storybook/test'

import { Inline, Inset } from '@/shared/ui/Layout.view'

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
        <Tabs.List label="Example views">
          <Inline as="div" gap="default">
            <Tabs.Trigger
              value="overview"
              variant="stacked"
              selected={value === 'overview'}
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="details"
              variant="stacked"
              selected={value === 'details'}
            >
              Details
            </Tabs.Trigger>
            <Tabs.Trigger value="unavailable" disabled>
              Unavailable
            </Tabs.Trigger>
          </Inline>
        </Tabs.List>
        <Tabs.Content value="overview">
          <Inset inset="default">Overview content</Inset>
        </Tabs.Content>
        <Tabs.Content value="details">
          <Inset inset="default">Detailed content</Inset>
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
