import { useAtomValue } from 'jotai'
import { type BarShapeProps, Rectangle } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import { BAR_CORNERS } from '@/shared/ui/chartAppearance/barCorners'
import { BAR_PROMINENCE } from '@/shared/ui/chartAppearance/barProminence'
import { barAppearanceAtom } from '@/shared/ui/stores/barAppearance.atoms'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; All four coordinates and inherited appearance must be validated together for one Recharts rectangle.
export function ChartRectangle({
  geometry,
  tone,
  prominence,
}: {
  geometry: Partial<Pick<BarShapeProps, 'x' | 'y' | 'width' | 'height'>>
  tone?: keyof typeof CHART_COLORS
  prominence?: keyof typeof BAR_PROMINENCE
}) {
  const appearance = useAtomValue(barAppearanceAtom)
  if (!appearance)
    throw new Error('ChartRectangle requires a SeriesBar parent.')
  const { x, y, width, height } = geometry
  if (x == null || y == null || width == null || height == null) return null
  const color = tone ?? appearance.tone
  const emphasis = prominence ?? appearance.prominence
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color && CHART_COLORS[color]}
      radius={appearance.corners && BAR_CORNERS[appearance.corners]}
      fillOpacity={emphasis && BAR_PROMINENCE[emphasis]}
    />
  )
}
