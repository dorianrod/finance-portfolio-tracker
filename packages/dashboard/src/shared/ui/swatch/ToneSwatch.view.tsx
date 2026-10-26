import { SWATCH_TONES } from '@/shared/ui/swatchAppearance/swatchTones'

import type { SwatchProps } from './swatch.types'
import { SwatchFrame } from './SwatchFrame.view'

export function ToneSwatch({
  tone,
  ...props
}: SwatchProps & { tone: keyof typeof SWATCH_TONES }) {
  return <SwatchFrame {...props} tone={tone} />
}
