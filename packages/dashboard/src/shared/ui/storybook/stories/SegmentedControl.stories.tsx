import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, waitFor } from 'storybook/test'

import {
  SegmentedControl,
  SegmentedControlItem,
} from '../../SegmentedControl.view'

const meta = {
  title: 'Navigation/SegmentedControl',
  component: SegmentedControl,
  argTypes: { density: { control: 'select', options: ['compact', 'default'] } },
} satisfies Meta<typeof SegmentedControl>
export default meta

type Args = React.ComponentProps<typeof SegmentedControl> & {
  selected: string
  tone: 'accent' | 'neutral'
  size: 'compact' | 'default' | 'large'
}
function Render(args: Args) {
  const [{ selected }, updateArgs] = useArgs<Args>()
  return (
    <SegmentedControl label={args.label} density={args.density}>
      <SegmentedControlItem
        size={args.size}
        tone={args.tone}
        active={selected === 'month'}
        onClick={() => updateArgs({ selected: 'month' })}
      >
        Month
      </SegmentedControlItem>
      <SegmentedControlItem
        size={args.size}
        tone={args.tone}
        active={selected === 'year'}
        onClick={() => updateArgs({ selected: 'year' })}
      >
        Year
      </SegmentedControlItem>
      <SegmentedControlItem disabled active={false}>
        Unavailable
      </SegmentedControlItem>
    </SegmentedControl>
  )
}
export const Playground: StoryObj<Args> = {
  args: {
    label: 'Period',
    children: null,
    selected: 'month',
    tone: 'accent',
    size: 'default',
  },
  render: Render,
  play: async ({ canvas, userEvent }) => {
    const year = canvas.getByRole('button', { name: 'Year' })
    await userEvent.click(year)
    await waitFor(() => expect(year).toHaveAttribute('aria-pressed', 'true'))
  },
}
export const Compact: StoryObj<Args> = {
  ...Playground,
  args: {
    ...Playground.args,
    density: 'compact',
    size: 'compact',
    tone: 'neutral',
  },
}
export const Large: StoryObj<Args> = {
  ...Playground,
  args: { ...Playground.args, size: 'large' },
}
