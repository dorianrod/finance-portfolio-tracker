import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartText } from '../../ChartText.view'
import { TooltipBox } from '../../TooltipBox.view'

const meta = {
  title: 'Surfaces/TooltipBox',
  component: TooltipBox,
  args: { children: null },
} satisfies Meta<typeof TooltipBox>
export default meta
type Story = StoryObj<typeof meta>

export const Theme: Story = {
  args: { variant: 'theme', size: 'default' },
  render: function Render(args) {
    return (
      <TooltipBox {...args}>
        <ChartText as="p" tone="tooltipLabel">
          Example value
        </ChartText>
        <ChartText tone="portfolioValue">12,450 €</ChartText>
      </TooltipBox>
    )
  },
}
export const Raised: Story = {
  ...Theme,
  args: { ...Theme.args, variant: 'raised', density: 'default' },
}
