import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'

import { GRADIENT_PROFILES } from '../../chartAppearance'
import { SeriesGradient } from '../../SeriesGradient.view'

const meta = {
  title: 'Charts/Gradients',
  component: SeriesGradient,
  argTypes: {
    profile: { control: 'select', options: Object.keys(GRADIENT_PROFILES) },
    id: { control: false },
  },
} satisfies Meta<typeof SeriesGradient>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { id: 'gradient-example', tone: 'series6', profile: 'soft' },
  render: function Render(args) {
    const id = useId()
    return (
      <svg width="280" height="140">
        <defs>
          <SeriesGradient {...args} id={id} />
        </defs>
        <rect width="280" height="140" fill={`url(#${id})`} />
      </svg>
    )
  },
}
export const Dense: Story = {
  ...Playground,
  args: { ...Playground.args, profile: 'dense' },
}
