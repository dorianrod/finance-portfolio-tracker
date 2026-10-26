import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'

import type { SwatchProps } from './swatch.types'
import { SwatchFrame } from './SwatchFrame.view'

export function SeriesSwatch({
  tone,
  selected = false,
  style,
  ...props
}: SwatchProps & { tone: keyof typeof CHART_COLORS; selected?: boolean }) {
  return (
    <SwatchFrame
      {...props}
      style={{
        ...style,
        backgroundColor: CHART_COLORS[tone],
        ...(selected && {
          outline: '2px solid var(--ds-content)',
          outlineOffset: 1,
        }),
      }}
    />
  )
}
