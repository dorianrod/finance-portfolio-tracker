import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, waitFor, within } from 'storybook/test'

import { Grid } from '@/shared/ui/Layout.view'

import { Button, DialogButton, Input } from '../../Controls.view'
import { SidePanel } from '../../SidePanel.view'

const meta = {
  title: 'Panels/SidePanel',
  component: SidePanel,
  args: { onClose: fn() },
  parameters: { docs: { story: { inline: false, height: '400px' } } },
} satisfies Meta<typeof SidePanel>
export default meta
type Story = StoryObj<typeof meta>

function Render(
  args: Omit<React.ComponentProps<typeof SidePanel>, 'className'>,
) {
  const [{ open }, updateArgs] = useArgs<typeof args>()
  return (
    <>
      <DialogButton
        expanded={open}
        variant="secondary"
        onClick={() => updateArgs({ open: true })}
      >
        Open panel
      </DialogButton>
      <SidePanel
        {...args}
        open={open}
        onClose={() => {
          args.onClose()
          updateArgs({ open: false })
        }}
      >
        <SidePanel.Title>Example details</SidePanel.Title>
        <SidePanel.Description>
          A fictional example with editable content.
        </SidePanel.Description>
        <SidePanel.HeaderActions>
          <Button variant="quiet" onClick={() => updateArgs({ open: false })}>
            Done
          </Button>
        </SidePanel.HeaderActions>
        <Grid columns={1} gap="relaxed" inset="default">
          <Input label="Example name" variant="filter" defaultValue="Sample" />
          <Button
            variant="secondary"
            onClick={() => updateArgs({ open: false })}
          >
            Close panel
          </Button>
        </Grid>
      </SidePanel>
    </>
  )
}
export const Closed: Story = {
  args: {
    open: false,
    closeLabel: 'Close details',
    size: 'default',
    children: null,
  },
  render: Render,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open panel' })
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(trigger)
    await expect(
      await body.findByRole('dialog', { name: 'Example details' }),
    ).toBeVisible()
    await expect(
      body.getByRole('button', { name: 'Close details' }),
    ).toHaveFocus()
    await userEvent.tab()
    await expect(
      body.getByRole('textbox', { name: 'Example name' }),
    ).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await expect(trigger).toHaveFocus()
  },
}
export const Open: Story = {
  ...Closed,
  args: { ...Closed.args, open: true },
  play: undefined,
}
export const Medium: Story = { ...Open, args: { ...Open.args, size: 'medium' } }
export const Wide: Story = { ...Open, args: { ...Open.args, size: 'wide' } }
