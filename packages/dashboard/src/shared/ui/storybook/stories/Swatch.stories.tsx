import type { Meta, StoryObj } from '@storybook/react-vite'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { SWATCH_SHAPES } from '@/shared/ui/swatchAppearance/swatchShapes'

const meta = {
  title: 'Charts/Swatches',
  component: SeriesSwatch,
  args: { tone: 'series6' },
  argTypes: {
    tone: { control: 'select', options: Object.keys(CHART_COLORS) },
    shape: { control: 'select', options: Object.keys(SWATCH_SHAPES) },
  },
} satisfies Meta<typeof SeriesSwatch>
export default meta
type Story = StoryObj<typeof meta>

function ToneExample({ tone }: { tone: keyof typeof CHART_COLORS }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block size-3">
        <SeriesSwatch tone={tone} shape="dot" />
      </span>
      {tone}
    </div>
  )
}
function ShapeExample({ shape }: { shape: keyof typeof SWATCH_SHAPES }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-6">
        <ToneSwatch tone="accent" shape={shape} />
      </span>
      {shape}
    </div>
  )
}
export const Series: Story = {
  args: {
    tone: 'series6',
    shape: 'dot',
  },
}
export const SemanticTones: Story = {
  render: function Tones() {
    return (
      <div className="grid gap-3">
        {Object.keys(CHART_COLORS)
          .filter((tone): tone is keyof typeof CHART_COLORS =>
            Object.hasOwn(CHART_COLORS, tone),
          )
          .map((tone) => (
            <ToneExample key={tone} tone={tone} />
          ))}
      </div>
    )
  },
}
export const Shapes: Story = {
  render: function Shapes() {
    return (
      <div className="grid gap-3">
        {Object.keys(SWATCH_SHAPES)
          .filter((shape): shape is keyof typeof SWATCH_SHAPES =>
            Object.hasOwn(SWATCH_SHAPES, shape),
          )
          .map((shape) => (
            <ShapeExample key={shape} shape={shape} />
          ))}
      </div>
    )
  },
}
export const Categories: Story = {
  render: function Categories() {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-block size-3">
          <SeriesSwatch
            tone={getHashedSeriesTone('Equity')}
            selected
            shape="dot"
          />
        </span>
        Equity
        <span className="inline-block size-3">
          <SeriesSwatch tone={getHashedSeriesTone('Bonds')} shape="dot" />
        </span>
        Bonds
      </div>
    )
  },
}
