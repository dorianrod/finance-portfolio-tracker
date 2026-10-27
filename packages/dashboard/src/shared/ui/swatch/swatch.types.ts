import { type HTMLAttributes } from 'react'

import { SWATCH_SHAPES } from '@/shared/ui/swatchAppearance/swatchShapes'

export type SwatchProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className' | 'style'
> & {
  as?: 'span' | 'div' | 'i'
  shape?: keyof typeof SWATCH_SHAPES
  prominence?: 'strong'
  share?: number
  size?: 'compact' | 'default' | 'large'
}
