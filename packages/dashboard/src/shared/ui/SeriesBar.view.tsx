import {
  type ComponentProps,
  type ReactNode,
  type SVGProps,
  useMemo,
} from 'react'
import { Bar, type BarShapeProps } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors'

import {
  type BarAppearance,
  BarAppearanceContext,
} from './barAppearanceContext'
import { BAR_CORNERS, BAR_PROMINENCE } from './chartAppearance'
import { partitionChartSlot } from './chartSlots'

export function SeriesBar({
  tone,
  corners,
  prominence,
  motion,
  transitioning,
  children,
  ...props
}: SeriesBarProps) {
  const { renderer, content } = partitionChartSlot<
    Partial<Omit<BarShapeProps, 'className'>> &
      Omit<SVGProps<SVGPathElement>, 'className'>
  >(children, SeriesBarShape)
  const appearance = useMemo(
    () => ({ tone, corners, prominence }),
    [tone, corners, prominence],
  )
  let animationActive
  if (motion === 'none') animationActive = false
  else if (motion === 'selection') animationActive = transitioning
  return (
    <BarAppearanceContext value={appearance}>
      <Bar
        {...props}
        fill={tone && CHART_COLORS[tone]}
        radius={corners && BAR_CORNERS[corners]}
        fillOpacity={prominence && BAR_PROMINENCE[prominence]}
        shape={renderer}
        isAnimationActive={animationActive}
        animationDuration={motion === 'selection' ? 450 : undefined}
        animationEasing={motion === 'selection' ? 'ease-in-out' : undefined}
      >
        {content}
      </Bar>
    </BarAppearanceContext>
  )
}

type BarDataKeys =
  | 'data'
  | 'dataKey'
  | 'xAxisId'
  | 'yAxisId'
  | 'name'
  | 'unit'
  | 'hide'
  | 'legendType'
  | 'id'
  | 'style'
  | 'children'
  | 'stackId'
  | 'barSize'
  | 'maxBarSize'
  | 'minPointSize'
  | 'onClick'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'animationMatchBy'
  | 'animationInterpolateFn'
  | 'zIndex'
type SeriesBarProps = Pick<
  ComponentProps<typeof Bar>,
  Extract<keyof ComponentProps<typeof Bar>, BarDataKeys>
> &
  BarAppearance & {
    motion?: 'none' | 'selection'
    transitioning?: boolean
  }

function SeriesBarShape({ children }: { children: ReactNode }) {
  return children
}

SeriesBar.Shape = SeriesBarShape
