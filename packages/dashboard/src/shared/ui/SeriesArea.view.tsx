import type { ComponentProps, ReactNode } from 'react'
import { Area } from 'recharts'

import { getLineHoverMarker } from '@/shared/ui/chartAppearance/getLineHoverMarker'
import { LINE_HOVER_MARKERS } from '@/shared/ui/chartAppearance/lineHoverMarkers'
import { LINE_MARKERS } from '@/shared/ui/chartAppearance/lineMarkers'
import { LINE_PATTERNS } from '@/shared/ui/chartAppearance/linePatterns'
import { LINE_WEIGHTS } from '@/shared/ui/chartAppearance/lineWeights'
import { seriesFill } from '@/shared/ui/chartAppearance/seriesFill'

import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'
import { partitionChartSlot } from './chartSlots'

export function SeriesArea({
  tone,
  gradientId,
  weight,
  pattern,
  markers,
  hover,
  children,
  ...props
}: SeriesAreaProps) {
  const { renderer, content } = partitionChartSlot(children, SeriesAreaMarkers)
  const color = resolveSeriesColor({ tone })
  return (
    <Area
      {...props}
      stroke={color}
      fill={seriesFill(gradientId)}
      strokeWidth={weight && LINE_WEIGHTS[weight]}
      strokeDasharray={pattern && LINE_PATTERNS[pattern]}
      dot={renderer ?? (markers && LINE_MARKERS[markers])}
      activeDot={getLineHoverMarker(hover, color)}
    >
      {content}
    </Area>
  )
}

type AreaDataKeys =
  | 'data'
  | 'dataKey'
  | 'type'
  | 'xAxisId'
  | 'yAxisId'
  | 'name'
  | 'unit'
  | 'connectNulls'
  | 'hide'
  | 'legendType'
  | 'id'
  | 'children'
  | 'stackId'
type SeriesAreaProps = Pick<
  ComponentProps<typeof Area>,
  Extract<keyof ComponentProps<typeof Area>, AreaDataKeys>
> &
  SeriesColor & {
    gradientId?: string
    weight?: keyof typeof LINE_WEIGHTS
    pattern?: keyof typeof LINE_PATTERNS
    markers?: keyof typeof LINE_MARKERS
    hover?: keyof typeof LINE_HOVER_MARKERS | 'series'
  }

function SeriesAreaMarkers({ children }: { children: ReactNode }) {
  return children
}

SeriesArea.Markers = SeriesAreaMarkers
