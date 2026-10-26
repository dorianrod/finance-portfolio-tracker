import { useContext } from 'react'
import { type BarShapeProps, Rectangle } from 'recharts'

import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { BarAppearanceContext } from './barAppearanceContext'
import { BAR_CORNERS, BAR_PROMINENCE } from './chartAppearance'

export function ChartRectangle({
  geometry,
  tone,
  prominence,
}: {
  geometry: Partial<Pick<BarShapeProps, 'x' | 'y' | 'width' | 'height'>>
  tone?: keyof typeof SEMANTIC_COLORS
  prominence?: keyof typeof BAR_PROMINENCE
}) {
  const appearance = useContext(BarAppearanceContext)
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
      fill={color && SEMANTIC_COLORS[color]}
      radius={appearance.corners && BAR_CORNERS[appearance.corners]}
      fillOpacity={emphasis && BAR_PROMINENCE[emphasis]}
    />
  )
}
