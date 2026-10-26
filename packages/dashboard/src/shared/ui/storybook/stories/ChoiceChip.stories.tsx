import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { ChoiceChip } from '../../ChoiceChip.view'

const meta = {
  title: 'Controls/ChoiceChip',
  component: ChoiceChip,
} satisfies Meta<typeof ChoiceChip>
export default meta
type Story = StoryObj<typeof meta>

function Render(
  args: Omit<React.ComponentProps<typeof ChoiceChip>, 'className'>,
) {
  const [{ active }, updateArgs] = useArgs<typeof args>()
  return (
    <ChoiceChip
      {...args}
      active={active}
      onClick={() => updateArgs({ active: !active })}
    />
  )
}
export const Inactive: Story = {
  args: { active: false, children: 'All accounts' },
  render: Render,
}
export const Active: Story = {
  ...Inactive,
  args: { ...Inactive.args, active: true },
}
export const Disabled: Story = {
  ...Inactive,
  args: { ...Inactive.args, disabled: true },
}
