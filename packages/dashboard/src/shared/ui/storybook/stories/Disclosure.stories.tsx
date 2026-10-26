import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor } from 'storybook/test'

import { Inset } from '@/shared/ui/Layout.view'

import { Disclosure } from '../../Disclosure.view'

const meta = {
  title: 'Panels/Disclosure',
  component: Disclosure,
} satisfies Meta<typeof Disclosure>
export default meta
type Story = StoryObj<typeof meta>

function Render(
  args: Omit<React.ComponentProps<typeof Disclosure>, 'className'>,
) {
  const [{ expanded }, updateArgs] = useArgs<typeof args>()
  return (
    <Disclosure {...args} expanded={expanded}>
      <Disclosure.Trigger
        variant="secondary"
        onClick={() => updateArgs({ expanded: !expanded })}
      >
        Show details
      </Disclosure.Trigger>
      <div className="mt-3">
        <Disclosure.Content variant="inset">
          <Inset inset="default">Disclosure content</Inset>
        </Disclosure.Content>
      </div>
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
