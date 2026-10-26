import type { Meta, StoryObj } from '@storybook/react-vite'

import { CHART_TEXT_TONES } from '../../chartAppearance'
import { ChartText } from '../../ChartText.view'

const meta = {
  title: 'Charts/Text',
  component: ChartText,
  argTypes: {
    tone: { control: 'select', options: Object.keys(CHART_TEXT_TONES) },
  },
} satisfies Meta<typeof ChartText>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { children: 'Example chart label', tone: 'series6' },
}
export const Tones: Story = {
  render: function Tones() {
    return (
      <div className="grid gap-2">
        {Object.keys(CHART_TEXT_TONES).map((tone) => (
          <ChartText key={tone} tone={tone as keyof typeof CHART_TEXT_TONES}>
            {tone}
          </ChartText>
        ))}
      </div>
    )
  },
}
export const Category: Story = {
  args: { tone: 'series1', children: 'Equity category' },
}
