import type { Meta, StoryObj } from '@storybook/react-vite'

import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { CategorySwatch, SeriesSwatch, ToneSwatch } from '../../Swatch.view'
import { SWATCH_SHAPES } from '../../swatchAppearance'

const meta = {
  title: 'Charts/Swatches',
  component: SeriesSwatch,
  args: { tone: 'portfolioValue' },
  argTypes: {
    tone: { control: 'select', options: Object.keys(SEMANTIC_COLORS) },
    shape: { control: 'select', options: Object.keys(SWATCH_SHAPES) },
  },
} satisfies Meta<typeof SeriesSwatch>
export default meta
type Story = StoryObj<typeof meta>

function ToneExample({ tone }: { tone: keyof typeof SEMANTIC_COLORS }) {
  return (
    <div className="flex items-center gap-2">
      <SeriesSwatch tone={tone} shape="dot" className="size-3" />
      {tone}
    </div>
  )
}
function ShapeExample({ shape }: { shape: keyof typeof SWATCH_SHAPES }) {
  return (
    <div className="flex items-center gap-2">
      <ToneSwatch tone="accent" shape={shape} className="h-3 w-6" />
      {shape}
    </div>
  )
}
export const Series: Story = {
  args: {
    tone: 'portfolioValue',
    shape: 'dot',
    className: 'inline-block h-3 w-3',
  },
}
export const SemanticTones: Story = {
  render: function Tones() {
    return (
      <div className="grid gap-3">
        {Object.keys(SEMANTIC_COLORS).map((tone) => (
          <ToneExample key={tone} tone={tone as keyof typeof SEMANTIC_COLORS} />
        ))}
      </div>
    )
  },
}
export const Shapes: Story = {
  render: function Shapes() {
    return (
      <div className="grid gap-3">
        {Object.keys(SWATCH_SHAPES).map((shape) => (
          <ShapeExample
            key={shape}
            shape={shape as keyof typeof SWATCH_SHAPES}
          />
        ))}
      </div>
    )
  },
}
export const Categories: Story = {
  render: function Categories() {
    return (
      <div className="flex items-center gap-3">
        <CategorySwatch
          category="Equity"
          selected
          shape="dot"
          className="size-3"
        />
        Equity
        <CategorySwatch category="Bonds" shape="dot" className="size-3" />
        Bonds
      </div>
    )
  },
}
