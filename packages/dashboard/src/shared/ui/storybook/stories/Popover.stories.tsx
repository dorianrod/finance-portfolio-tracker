import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor, within } from 'storybook/test'

import { Button, Input } from '../../Controls.view'
import { Popover } from '../../Popover.view'

const meta = { title: 'Panels/Popover', component: Popover } satisfies Meta<
  typeof Popover
>
export default meta
type Story = StoryObj<typeof meta>

function Render(args: React.ComponentProps<typeof Popover>) {
  const [{ open }, updateArgs] = useArgs<typeof args>()
  return (
    <Popover
      {...args}
      open={open}
      onOpenChange={(open) => updateArgs({ open })}
    >
      <Popover.Trigger asChild>
        <Button variant="secondary" className="p-3">
          Open filters
        </Button>
      </Popover.Trigger>
      <Popover.Content label="Example filters">
        <div className="grid gap-3">
          <Input label="Filter name" variant="filter" className="p-2" />
          <Button
            variant="primaryCompact"
            className="p-2"
            onClick={() => updateArgs({ open: false })}
          >
            Apply filters
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  )
}
export const Closed: Story = {
  args: { open: false },
  render: Render,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open filters' })
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(trigger)
    await expect(
      await body.findByRole('dialog', { name: 'Example filters' }),
    ).toBeVisible()
    await userEvent.type(
      body.getByRole('textbox', { name: 'Filter name' }),
      'Example',
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await expect(trigger).toHaveFocus()
  },
}
export const Open: Story = { ...Closed, args: { open: true }, play: undefined }
