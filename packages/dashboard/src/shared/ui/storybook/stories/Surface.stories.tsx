import type { Meta, StoryObj } from '@storybook/react-vite'

import { Surface } from '../../Surface.view'
import { SURFACE_VARIANTS } from '../../surfaceAppearance'

const meta = {
  title: 'Surfaces/Surface',
  component: Surface,
  args: { variant: 'card' },
  argTypes: {
    variant: { control: 'select', options: Object.keys(SURFACE_VARIANTS) },
  },
} satisfies Meta<typeof Surface>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { variant: 'card', children: 'Surface content', className: 'p-4' },
}
export const Variants: Story = {
  render: function Variants() {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.keys(SURFACE_VARIANTS).map((variant) => (
          <Surface
            key={variant}
            variant={variant as keyof typeof SURFACE_VARIANTS}
            className="p-4"
          >
            {variant}
          </Surface>
        ))}
      </div>
    )
  },
}
