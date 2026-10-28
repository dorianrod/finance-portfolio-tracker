import type { ComponentProps, ReactNode } from 'react'
import { Line } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import { getLineHoverMarker } from '@/shared/ui/chartAppearance/getLineHoverMarker'
import type { LINE_HOVER_MARKERS } from '@/shared/ui/chartAppearance/lineHoverMarkers'
import { LINE_MARKERS } from '@/shared/ui/chartAppearance/lineMarkers'
import { LINE_PATTERNS } from '@/shared/ui/chartAppearance/linePatterns'
import { LINE_WEIGHTS } from '@/shared/ui/chartAppearance/lineWeights'

import { partitionChartSlot } from './chartSlots'

export function SeriesLine({
  tone,
  weight,
  pattern,
  markers,
  hover,
  motion,
  children,
  ...props
}: SeriesLineProps) {
  const { renderer, content } = partitionChartSlot(children, SeriesLineMarkers)
  const color = CHART_COLORS[tone]
  return (
    <Line
      {...props}
      stroke={color}
      strokeWidth={weight && LINE_WEIGHTS[weight]}
      strokeDasharray={pattern && LINE_PATTERNS[pattern]}
      dot={renderer ?? (markers && LINE_MARKERS[markers])}
      activeDot={getLineHoverMarker(hover, color)}
      isAnimationActive={motion === 'none' ? false : undefined}
    >
      {content}
    </Line>
  )
}

type LineDataKeys =
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
type SeriesLineProps = Pick<
  ComponentProps<typeof Line>,
  Extract<keyof ComponentProps<typeof Line>, LineDataKeys>
> & {
  tone: keyof typeof CHART_COLORS
  weight?: keyof typeof LINE_WEIGHTS
  pattern?: keyof typeof LINE_PATTERNS
  markers?: keyof typeof LINE_MARKERS
  hover?: keyof typeof LINE_HOVER_MARKERS | 'series'
  motion?: 'none'
}

function SeriesLineMarkers({ children }: { children: ReactNode }) {
  return children
}

SeriesLine.Markers = SeriesLineMarkers
