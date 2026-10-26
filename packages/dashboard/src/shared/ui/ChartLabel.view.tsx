import type { ReactNode, SVGProps } from 'react'

import { CHART_THEME } from '@/shared/theme/chartTheme'

import { type ChartAge, chartAgeOpacity } from './chartAgeAppearance'
import { CHART_TEXT_TONES } from './chartAppearance'

export function ChartLabel({
  as: Tag = 'text',
  tone = 'label',
  variant = 'standard',
  align,
  age,
  ...props
}: Props) {
  const fill = {
    ...CHART_TEXT_TONES,
    label: CHART_THEME.label,
    tick: CHART_THEME.tick,
  }[tone]
  return (
    <Tag
      {...props}
      fill={fill}
      fontSize={variant === 'compact' || variant === 'pie' ? 10 : 11}
      textAnchor={align}
      dominantBaseline={
        !age && (variant === 'pie' || variant === 'standard')
          ? 'central'
          : undefined
      }
      fillOpacity={age && chartAgeOpacity(age)}
      fontWeight={age && (age.recent ? 600 : 400)}
      pointerEvents={age ? 'none' : undefined}
    />
  )
}

export function ChartLeaderLine(
  props: Pick<SVGProps<SVGPolylineElement>, 'points'>,
) {
  return (
    <polyline
      {...props}
      fill="none"
      stroke={CHART_THEME.zeroLine}
      strokeWidth={0.75}
    />
  )
}

type Props = Pick<
  SVGProps<SVGTextElement>,
  'x' | 'y' | 'dx' | 'dy' | 'transform' | 'style'
> & {
  as?: 'text' | 'tspan'
  children: ReactNode
  tone?: keyof typeof CHART_TEXT_TONES | 'label' | 'tick'
  variant?: 'standard' | 'compact' | 'pie'
  align?: 'start' | 'middle' | 'end'
  age?: ChartAge
}
