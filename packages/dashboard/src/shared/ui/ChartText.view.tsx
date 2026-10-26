import { CHART_TEXT_TONES } from './chartAppearance'
import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'
import { Text, type TextProps, type TextTag } from './Text.view'

type ChartTextProps<T extends TextTag> = Omit<TextProps<T>, 'tone'> & {
  tone?: keyof typeof CHART_TEXT_TONES
  series?: { color?: string }
  category?: string
  group?: NonNullable<SeriesColor['group']>
  separator?: boolean
}

export function ChartText<T extends TextTag = 'span'>({
  tone,
  series,
  category,
  group,
  separator = false,
  style,
  ...props
}: ChartTextProps<T>) {
  return (
    <Text
      {...props}
      style={{
        ...style,
        color:
          series?.color ??
          (category || group
            ? resolveSeriesColor({ category, group })
            : tone && CHART_TEXT_TONES[tone]),
        ...(separator && { borderTop: '1px solid var(--tooltip-border)' }),
      }}
    />
  )
}
