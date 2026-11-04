import type { Meta, StoryObj } from '@storybook/react-vite'

import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'

import { Surface } from '../../Surface.view'

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
  args: { variant: 'card', children: 'Surface content' },
}
function SurfaceVariant({
  variant,
}: {
  variant: keyof typeof SURFACE_VARIANTS
}) {
  return <Surface variant={variant}>{variant}</Surface>
}

export const Variants: Story = {
  render: function Variants() {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.keys(SURFACE_VARIANTS)
          .filter((variant): variant is keyof typeof SURFACE_VARIANTS =>
            Object.hasOwn(SURFACE_VARIANTS, variant),
          )
          .map((variant) => (
            <SurfaceVariant key={variant} variant={variant} />
          ))}
      </div>
    )
  },
}
