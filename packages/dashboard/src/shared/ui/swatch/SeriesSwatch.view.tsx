import type { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'

import type { SwatchProps } from './swatch.types'
import { SwatchFrame } from './SwatchFrame.view'

export function SeriesSwatch({
  tone,
  selected = false,
  ...props
}: SwatchProps & { tone: keyof typeof CHART_COLORS; selected?: boolean }) {
  return <SwatchFrame {...props} series={{ tone, selected }} />
}
