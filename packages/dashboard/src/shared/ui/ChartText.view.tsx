import { CHART_TEXT_TONES } from './chartAppearance'
import { Text, type TextProps, type TextTag } from './Text.view'

export function ChartText<T extends TextTag = 'span'>({
  tone,
  series,
  separator = false,
  style,
  ...props
}: ChartTextProps<T>) {
  return (
    <Text
      {...props}
      style={{
        ...style,
        color: series?.color ?? (tone && CHART_TEXT_TONES[tone]),
        ...(separator && { borderTop: '1px solid var(--tooltip-border)' }),
      }}
    />
  )
}

type ChartTextProps<T extends TextTag> = Omit<TextProps<T>, 'tone'> & {
  tone?: keyof typeof CHART_TEXT_TONES
  series?: { color?: string }
  separator?: boolean
}
