import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'

import { ChartScaleToggle } from '../../ChartScaleToggle.view'

const meta = {
  title: 'Navigation/ChartScaleToggle',
  component: ChartScaleToggle,
} satisfies Meta<typeof ChartScaleToggle>
export default meta
type Story = StoryObj<typeof meta>

function Render(
  args: Omit<React.ComponentProps<typeof ChartScaleToggle>, 'className'>,
) {
  const [{ value }, updateArgs] = useArgs<typeof args>()
  return (
    <ChartScaleToggle
      {...args}
      value={value}
      onChange={(value) => {
        args.onChange(value)
        updateArgs({ value })
      }}
    />
  )
}
export const Value: Story = {
  args: { valueLabel: 'Units', value: 'value', onChange: fn() },
  render: Render,
}
export const Percentage: Story = {
  ...Value,
  args: { ...Value.args, value: 'percentage' },
}
