import { type HTMLAttributes } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { SWATCH_SHAPES } from '@/shared/ui/swatchAppearance/swatchShapes'

export type SwatchProps = ControlProps<HTMLAttributes<HTMLSpanElement>> & {
  as?: 'span' | 'div' | 'i'
  shape?: keyof typeof SWATCH_SHAPES
  prominence?: 'strong'
  share?: number
  size?: 'compact' | 'default' | 'large'
}
