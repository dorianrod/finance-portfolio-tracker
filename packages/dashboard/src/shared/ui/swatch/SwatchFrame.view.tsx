import { createElement } from 'react'

import { SWATCH_SIZES } from '@/shared/ui/layoutAppearance/swatchSizes'
import { layoutShare } from '@/shared/ui/layoutGeometry'
import { SWATCH_SHAPES } from '@/shared/ui/swatchAppearance/swatchShapes'
import { SWATCH_TONES } from '@/shared/ui/swatchAppearance/swatchTones'

import type { SwatchProps } from './swatch.types'

export function SwatchFrame({
  as = 'span',
  shape = 'line',
  prominence,
  share,
  size,
  style,
  tone,
  ...props
}: SwatchProps & { tone?: keyof typeof SWATCH_TONES }) {
  return createElement(as, {
    ...props,
    'aria-hidden': true,
    style: {
      ...style,
      ...(share !== undefined && { width: `${layoutShare(share)}%` }),
    },
    className:
      [
        size ? SWATCH_SIZES[size] : 'block h-full w-full',
        SWATCH_SHAPES[shape],
        tone && SWATCH_TONES[tone],
        prominence === 'strong' && 'opacity-80',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  })
}
