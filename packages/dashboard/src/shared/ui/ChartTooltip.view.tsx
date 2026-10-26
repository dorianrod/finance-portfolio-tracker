import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
} from 'react'
import { Tooltip, type TooltipContentProps } from 'recharts'
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

import { CHART_CURSORS } from '@/shared/ui/chartAppearance/chartCursors'

export function ChartTooltip({ highlight, children, ...props }: Props) {
  const content = children == null ? undefined : Children.only(children)
  if (
    content != null &&
    !isValidElement<TooltipContentProps<ValueType, NameType>>(content)
  )
    throw new Error('ChartTooltip requires one tooltip element.')
  return (
    <Tooltip
      {...props}
      cursor={highlight && CHART_CURSORS[highlight]}
      content={content ?? undefined}
    />
  )
}

type DataKeys =
  | 'active'
  | 'defaultIndex'
  | 'shared'
  | 'trigger'
  | 'position'
  | 'offset'
  | 'allowEscapeViewBox'
  | 'filterNull'
  | 'includeHidden'
  | 'formatter'
  | 'labelFormatter'
  | 'itemSorter'
type Props = Pick<
  ComponentProps<typeof Tooltip>,
  Extract<keyof ComponentProps<typeof Tooltip>, DataKeys>
> & {
  highlight?: keyof typeof CHART_CURSORS
  children?: ReactNode
}
