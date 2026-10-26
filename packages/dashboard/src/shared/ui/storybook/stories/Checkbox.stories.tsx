import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, waitFor } from 'storybook/test'

import { Checkbox } from '../../Checkbox.view'
import { ChoiceRow } from '../../FormElements.view'

const meta = { title: 'Controls/Checkbox', component: Checkbox } satisfies Meta<
  typeof Checkbox
>
export default meta
type Story = StoryObj<typeof meta>

function Render(args: React.ComponentProps<typeof Checkbox>) {
  const [{ checked }, updateArgs] = useArgs<typeof args>()
  return (
    <ChoiceRow className="inline-flex items-center gap-2 p-2">
      <Checkbox
        {...args}
        checked={checked}
        onChange={(event) => {
          args.onChange(event)
          updateArgs({ checked: event.target.checked, indeterminate: false })
        }}
      />
      Include example
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
