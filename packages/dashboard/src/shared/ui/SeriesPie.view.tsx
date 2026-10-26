import type { ComponentProps, ReactNode } from 'react'
import {
  Pie,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
} from 'recharts'

import { CHART_THEME } from '@/shared/theme/chartTheme'

import { partitionChartSlot } from './chartSlots'

type Keys =
  | 'data'
  | 'dataKey'
  | 'nameKey'
  | 'innerRadius'
  | 'outerRadius'
  | 'paddingAngle'
  | 'startAngle'
  | 'endAngle'
  | 'onClick'
  | 'cx'
  | 'cy'
  | 'children'
type Props = Pick<
  ComponentProps<typeof Pie>,
  Extract<keyof ComponentProps<typeof Pie>, Keys>
> & { interactive?: boolean; labelConnector?: boolean; motion?: 'none' }
export function SeriesPie({
  children,
  interactive = false,
  labelConnector = false,
  motion,
  ...props
}: Props) {
  const { renderer: shape, content } = partitionChartSlot<
    Partial<Omit<PieSectorShapeProps, 'className'>>
  >(children, SeriesPieShape)
  const { renderer: label, content: rest } = partitionChartSlot<
    Partial<Omit<PieLabelRenderProps, 'className'>>
  >(content, SeriesPieLabels)
  return (
    <Pie
      {...props}
      isAnimationActive={motion === 'none' ? false : undefined}
      shape={shape}
      label={label}
      labelLine={
        labelConnector
          ? { stroke: CHART_THEME.zeroLine, strokeWidth: 1 }
          : false
      }
      style={interactive ? { cursor: 'pointer' } : undefined}
    >
      {rest}
    </Pie>
  )
}
function SeriesPieShape({ children }: { children: ReactNode }) {
  return children
}
function SeriesPieLabels({ children }: { children: ReactNode }) {
  return children
}
SeriesPie.Shape = SeriesPieShape
SeriesPie.Labels = SeriesPieLabels
