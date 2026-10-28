import type { Meta, StoryObj } from '@storybook/react-vite'

import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'
import { TEXT_VARIANTS } from '@/shared/ui/textAppearance/textVariants'

import { Text } from '../../Text.view'

const meta = {
  title: 'Typography/Text',
  component: Text,
  argTypes: {
    variant: { control: 'select', options: Object.keys(TEXT_VARIANTS) },
    tone: { control: 'select', options: Object.keys(TEXT_TONES) },
  },
} satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: 'A clear, readable message',
    variant: 'body',
    tone: 'default',
  },
}
export const Variants: Story = {
  render: function Variants() {
    return (
      <div className="grid gap-3">
        {Object.keys(TEXT_VARIANTS)
          .filter((variant): variant is keyof typeof TEXT_VARIANTS =>
            Object.hasOwn(TEXT_VARIANTS, variant),
          )
          .map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}
            </Text>
          ))}
      </div>
    )
  },
}
export const Tones: Story = {
  render: function Tones() {
    return (
      <div className="grid gap-3">
        {Object.keys(TEXT_TONES)
          .filter((tone): tone is keyof typeof TEXT_TONES =>
            Object.hasOwn(TEXT_TONES, tone),
          )
          .map((tone) => (
            <Text key={tone} tone={tone}>
              {tone}
            </Text>
          ))}
      </div>
    )
  },
}
export const Truncated: Story = {
  args: {
    children: 'A long descriptive label that exceeds the available space',
    truncate: true,
  },
}
