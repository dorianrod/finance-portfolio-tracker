import type { ComponentProps, ReactNode } from 'react'
import { Area } from 'recharts'

import {
  getLineHoverMarker,
  LINE_HOVER_MARKERS,
  LINE_MARKERS,
  LINE_PATTERNS,
  LINE_WEIGHTS,
  seriesFill,
} from './chartAppearance'
import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'
import { partitionChartSlot } from './chartSlots'

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
  | 'className'
  | 'style'
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

export function SeriesArea({
  tone,
  category,
  group,
  gradientId,
  weight,
  pattern,
  markers,
  hover,
  children,
  ...props
}: SeriesAreaProps) {
  const { renderer, content } = partitionChartSlot(children, SeriesAreaMarkers)
  const color = resolveSeriesColor({ tone, category, group })
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

function SeriesAreaMarkers({ children }: { children: ReactNode }) {
  return children
}

SeriesArea.Markers = SeriesAreaMarkers
