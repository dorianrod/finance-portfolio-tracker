import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, waitFor } from 'storybook/test'

import { Inline } from '@/shared/ui/Layout.view'

import { Checkbox } from '../../Checkbox.view'
import { ChoiceRow } from '../../FormElements.view'

const meta = { title: 'Controls/Checkbox', component: Checkbox } satisfies Meta<
  typeof Checkbox
>
export default meta
type Story = StoryObj<typeof meta>

function Render(
  args: Omit<React.ComponentProps<typeof Checkbox>, 'className'>,
) {
  const [{ checked }, updateArgs] = useArgs<typeof args>()
  return (
    <ChoiceRow>
      <Inline as="span" align="center" gap="default" inset="compact">
        <Checkbox
          {...args}
          checked={checked}
          onChange={(event) => {
            args.onChange(event)
            updateArgs({ checked: event.target.checked, indeterminate: false })
          }}
        />
        Include example
      </Inline>
    </ChoiceRow>
  )
}
export const Unchecked: Story = {
  args: {
    checked: false,
    indeterminate: false,
    size: 'standard',
    onChange: fn(),
  },
  render: Render,
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Include example' })
    await userEvent.click(checkbox)
    await waitFor(() => expect(checkbox).toBeChecked())
  },
}
export const Checked: Story = {
  ...Unchecked,
  args: { ...Unchecked.args, checked: true },
  play: undefined,
}
export const Indeterminate: Story = {
  ...Unchecked,
  args: { ...Unchecked.args, indeterminate: true },
  play: undefined,
}
export const Small: Story = {
  ...Unchecked,
  args: { ...Unchecked.args, size: 'small' },
  play: undefined,
}
