import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'

import { Tooltip } from '../../Tooltip.view'

const meta = {
  title: 'Panels/Tooltip',
  component: Tooltip,
  args: { children: null },
} satisfies Meta<typeof Tooltip>
export default meta
type Story = StoryObj<typeof meta>

export const Information: Story = {
  render: function Render() {
    return (
      <Tooltip>
        <Tooltip.Trigger variant="info" label="About this example">
          i
        </Tooltip.Trigger>
        <Tooltip.Content variant="info">
          Additional example information
        </Tooltip.Content>
      </Tooltip>
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.hover(
      canvas.getByRole('button', { name: 'About this example' }),
    )
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Additional example information',
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    )
  },
}
export const Source: Story = {
  render: function Render() {
    return (
      <Tooltip>
        <Tooltip.Trigger variant="source">Example source</Tooltip.Trigger>
        <Tooltip.Content variant="left">
          Fictional report, January 2025
        </Tooltip.Content>
      </Tooltip>
    )
  },
}
export const Help: Story = {
  render: function Render() {
    return (
      <Tooltip>
        <Tooltip.Trigger variant="help" label="Help with this example">
          ?
        </Tooltip.Trigger>
        <Tooltip.Content>Helpful explanation</Tooltip.Content>
      </Tooltip>
    )
  },
}
