import { createElement } from 'react'

import { CHART_TEXT_TONES } from '@/shared/ui/chartAppearance/chartTextTones'
import { getTextClassName } from '@/shared/ui/textAppearance/getTextClassName'

import type { TextProps, TextTag } from './Text.view'

export function ChartText<T extends TextTag = 'span'>({
  as,
  variant,
  align,
  wrap,
  numeric,
  truncate,
  tone,
  series,
  separator = false,
  ...props
}: ChartTextProps<T>) {
  return createElement(as ?? 'span', {
    ...props,
    className: getTextClassName({
      as,
      variant,
      align,
      wrap,
      numeric,
      truncate,
    }),
    style: {
      color: series?.color ?? (tone && CHART_TEXT_TONES[tone]),
      ...(separator && { borderTop: '1px solid var(--tooltip-border)' }),
    },
  })
}

type ChartTextProps<T extends TextTag> = Omit<TextProps<T>, 'tone'> & {
  tone?: keyof typeof CHART_TEXT_TONES
  series?: { color?: string }
  separator?: boolean
}
