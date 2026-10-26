import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor } from 'storybook/test'

import { Disclosure } from '../../Disclosure.view'

const meta = {
  title: 'Panels/Disclosure',
  component: Disclosure,
} satisfies Meta<typeof Disclosure>
export default meta
type Story = StoryObj<typeof meta>

function Render(args: React.ComponentProps<typeof Disclosure>) {
  const [{ expanded }, updateArgs] = useArgs<typeof args>()
  return (
    <Disclosure {...args} expanded={expanded}>
      <Disclosure.Trigger
        variant="secondary"
        className="p-2"
        onClick={() => updateArgs({ expanded: !expanded })}
      >
        Show details
      </Disclosure.Trigger>
      <Disclosure.Content variant="inset" className="mt-3 p-4">
        Disclosure content
      </Disclosure.Content>
    </Disclosure>
  )
}
export const Collapsed: Story = {
  args: { expanded: false, children: null },
  render: Render,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Show details' })
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'))
    await expect(canvas.getByText('Disclosure content')).toBeVisible()
  },
}
export const Expanded: Story = {
  ...Collapsed,
  args: { ...Collapsed.args, expanded: true },
  play: undefined,
}
