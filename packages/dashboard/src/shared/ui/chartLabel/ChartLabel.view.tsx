import type { ReactNode, SVGProps } from 'react'

import { CHART_THEME } from '@/shared/theme/chartTheme'
import type { ChartAge } from '@/shared/ui/chartAgeAppearance'
import { CHART_TEXT_TONES } from '@/shared/ui/chartAppearance/chartTextTones'

import { getChartLabelAgeAppearance } from './helpers/presenters/getChartLabelAgeAppearance'

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
      fontSize={LABEL_TYPOGRAPHY[variant].fontSize}
      textAnchor={align}
      dominantBaseline={
        !age && LABEL_TYPOGRAPHY[variant].centered ? 'central' : undefined
      }
      {...getChartLabelAgeAppearance(age)}
    />
  )
}

type Props = Pick<
  SVGProps<SVGTextElement>,
  'x' | 'y' | 'dx' | 'dy' | 'transform'
> & {
  as?: 'text' | 'tspan'
  children: ReactNode
  tone?: keyof typeof CHART_TEXT_TONES | 'label' | 'tick'
  variant?: 'standard' | 'compact' | 'pie'
  align?: 'start' | 'middle' | 'end'
  age?: ChartAge
}

const LABEL_TYPOGRAPHY = {
  standard: { fontSize: 11, centered: true },
  compact: { fontSize: 10, centered: false },
  pie: { fontSize: 10, centered: true },
} as const
