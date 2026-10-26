import { type ComponentPropsWithoutRef, createElement } from 'react'

import { SURFACE_VARIANTS } from './surfaceAppearance'
import { TEXT_ALIGNMENTS, TEXT_TONES, type TextTone } from './textAppearance'

type SurfaceTag =
  | 'p'
  | 'div'
  | 'span'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'aside'
  | 'main'
  | 'li'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'td'

type SurfaceProps<T extends SurfaceTag> = ComponentPropsWithoutRef<T> & {
  as?: T
  variant: keyof typeof SURFACE_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
}

export function Surface<T extends SurfaceTag = 'div'>({
  as,
  variant,
  tone,
  align,
  className,
  ...props
}: SurfaceProps<T>) {
  return createElement(as ?? 'div', {
    ...props,
    className: [
      SURFACE_VARIANTS[variant],
      tone && TEXT_TONES[tone],
      align && TEXT_ALIGNMENTS[align],
      className,
    ]
      .filter(Boolean)
      .join(' '),
  })
}
