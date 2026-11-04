import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor, within } from 'storybook/test'

import { Button } from '@/shared/ui/controls/Button.view'
import { Input } from '@/shared/ui/controls/Input.view'
import { Grid } from '@/shared/ui/layout/Grid.view'

import { Popover } from '../../Popover.view'

const meta = { title: 'Panels/Popover', component: Popover } satisfies Meta<
  typeof Popover
>
export default meta
type Story = StoryObj<typeof meta>

function Render(args: Omit<React.ComponentProps<typeof Popover>, 'className'>) {
  const [{ open }, updateArgs] = useArgs<typeof args>()
  return (
    <Popover
      {...args}
      open={open}
      onOpenChange={(open) => updateArgs({ open })}
    >
      <Popover.Trigger asChild>
        <Button variant="secondary">Open filters</Button>
      </Popover.Trigger>
      <Popover.Content label="Example filters">
        <Grid columns={1} gap="default">
          <Input label="Filter name" variant="filter" />
          <Button
            variant="primaryCompact"
            onClick={() => updateArgs({ open: false })}
          >
            Apply filters
          </Button>
        </Grid>
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
