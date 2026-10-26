import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from '../../Text.view'
import { TEXT_TONES, TEXT_VARIANTS } from '../../textAppearance'

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
        {Object.keys(TEXT_VARIANTS).map((variant) => (
          <Text key={variant} variant={variant as keyof typeof TEXT_VARIANTS}>
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
        {Object.keys(TEXT_TONES).map((tone) => (
          <Text key={tone} tone={tone as keyof typeof TEXT_TONES}>
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
