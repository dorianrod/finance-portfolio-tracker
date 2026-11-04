import { type ComponentPropsWithoutRef, createElement } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { getSurfaceLayoutClass } from '@/shared/ui/surfaceAppearance/getSurfaceLayoutClass'
import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'
import { TEXT_ALIGNMENTS } from '@/shared/ui/textAppearance/textAlignments'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

import { getSurfacePaddingClass } from './surfaceAppearance/getSurfacePaddingClass'

export function Surface<T extends SurfaceTag = 'div'>({
  as,
  variant,
  layout = 'block',
  tone,
  align,
  ...props
}: SurfaceProps<T>) {
  return createElement(as ?? 'div', {
    ...props,
    className: [
      layout === 'subgrid'
        ? 'grid row-span-3 grid-rows-subgrid'
        : getSurfaceLayoutClass(as, variant),
      SURFACE_VARIANTS[variant],
      getSurfacePaddingClass(variant),
      tone && TEXT_TONES[tone],
      align && TEXT_ALIGNMENTS[align],
    ]
      .filter(Boolean)
      .join(' '),
  })
}

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

type SurfaceProps<T extends SurfaceTag> = ControlProps<
  ComponentPropsWithoutRef<T>
> & {
  as?: T
  variant: keyof typeof SURFACE_VARIANTS
  layout?: 'block' | 'subgrid'
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
}
