import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartText } from '../../ChartText.view'
import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesBar } from '../../SeriesBar.view'
import { TooltipBox } from '../../TooltipBox.view'
import { CartesianExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Tooltip',
  component: ChartTooltip,
} satisfies Meta<typeof ChartTooltip>
export default meta
type Story = StoryObj<typeof meta>

function TooltipContent({
  active,
  label,
  payload,
}: {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{ value?: unknown }>
}) {
  if (!active) return null
  return (
    <TooltipBox>
      <ChartText as="p" tone="tooltipLabel">
        {label}
      </ChartText>
      <ChartText tone="portfolioValue">
        {String(payload?.[0]?.value ?? '—')}
      </ChartText>
    </TooltipBox>
  )
}
export const Active: Story = {
  args: { active: true, defaultIndex: 2, highlight: 'bar' },
  render: function Render(args) {
    return (
      <CartesianExample>
        <ChartTooltip
          active={args.active}
          defaultIndex={args.defaultIndex}
          highlight={args.highlight}
        >
          <TooltipContent />
        </ChartTooltip>
        <SeriesBar dataKey="value" tone="portfolioValue" motion="none" />
      </CartesianExample>
    )
  },
}
export const Hover: Story = { ...Active, args: { highlight: 'bar' } }
