import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, waitFor, within } from 'storybook/test'

import { Button } from '@/shared/ui/controls/Button.view'
import { Grid } from '@/shared/ui/layout/Grid.view'

import { Preview } from '../../Preview.view'

const meta = {
  title: 'Panels/Preview',
  component: Preview,
  args: { open: false, onOpenChange: fn(), children: null },
} satisfies Meta<typeof Preview>
export default meta
type Story = StoryObj<typeof meta>

function PreviewExample({
  open,
  onOpenChange,
}: Omit<React.ComponentProps<typeof Preview>, 'className'>) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const setOpen = onOpenChange
  return (
    <Preview open={open} onOpenChange={setOpen}>
      <Preview.Trigger
        variant="secondary"
        onPreview={(element) => {
          setAnchor(element.getBoundingClientRect())
          setOpen(true)
        }}
        onDismiss={() => setOpen(false)}
      >
        Preview example
      </Preview.Trigger>
      {anchor && (
        <Preview.Content
          anchor={anchor}
          label="Example preview"
          variant="tooltip"
        >
          <Grid columns={1} gap="default">
            <span>Preview content</span>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close preview
            </Button>
          </Grid>
        </Preview.Content>
      )}
    </Preview>
  )
}
export const HoverOrFocus: Story = {
  render: function Render(args) {
    const [{ open }, updateArgs] = useArgs<typeof args>()
    return (
      <PreviewExample
        {...args}
        open={open}
        onOpenChange={(open) => {
          args.onOpenChange(open)
          updateArgs({ open })
        }}
      />
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Preview example' })
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.hover(trigger)
    await expect(
      await body.findByRole('dialog', { name: 'Example preview' }),
    ).toBeVisible()
    await userEvent.unhover(trigger)
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    trigger.focus()
    await body.findByRole('dialog')
    await userEvent.keyboard('{ArrowDown}')
    await expect(
      body.getByRole('button', { name: 'Close preview' }),
    ).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveFocus()
  },
}
