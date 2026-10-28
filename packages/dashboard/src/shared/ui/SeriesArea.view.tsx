import type { ComponentProps, ReactNode } from 'react'
import { Area } from 'recharts'

import { getLineHoverMarker } from '@/shared/ui/chartAppearance/getLineHoverMarker'
import type { LINE_HOVER_MARKERS } from '@/shared/ui/chartAppearance/lineHoverMarkers'
import { LINE_MARKERS } from '@/shared/ui/chartAppearance/lineMarkers'
import { LINE_PATTERNS } from '@/shared/ui/chartAppearance/linePatterns'
import { LINE_WEIGHTS } from '@/shared/ui/chartAppearance/lineWeights'
import { seriesFill } from '@/shared/ui/chartAppearance/seriesFill'

import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'
import { partitionChartSlot } from './chartSlots'

export function SeriesArea<TData = unknown>({
  tone,
  gradientId,
  weight,
  pattern,
  markers,
  hover,
  children,
  ...props
}: SeriesAreaProps<TData>) {
  const { renderer, content } = partitionChartSlot(children, SeriesAreaMarkers)
  const color = resolveSeriesColor({ tone })
  return (
    <Area<TData, unknown>
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
type SeriesAreaProps<TData> = Pick<
  ComponentProps<typeof Area<TData, unknown>>,
  Extract<keyof ComponentProps<typeof Area<TData, unknown>>, AreaDataKeys>
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
