import { type ComponentPropsWithoutRef, createElement } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'
import { TEXT_ALIGNMENTS } from '@/shared/ui/textAppearance/textAlignments'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

// eslint-disable-next-line complexity -- Element-specific structure, padding and semantic appearance belong to the same Surface primitive.
export function Surface<T extends SurfaceTag = 'div'>({
  as,
  variant,
  tone,
  align,
  ...props
}: SurfaceProps<T>) {
  let layoutClass = 'block h-full'
  if (as === 'span') layoutClass = 'inline-flex h-full'
  if (
    as === 'span' &&
    (variant === 'statusFrame' ||
      variant === 'statusCanvasFrame' ||
      variant === 'overlay')
  )
    layoutClass =
      variant === 'overlay'
        ? 'block h-full w-full'
        : 'grid size-full place-items-center'
  if (as === 'table') layoutClass = 'w-full'
  else if (as === 'thead') layoutClass = 'sticky top-0 z-10'
  else if (as === 'tr' || as === 'tbody' || as === 'td') layoutClass = ''
  return createElement(as ?? 'div', {
    ...props,
    className: [
      layoutClass,
      SURFACE_VARIANTS[variant],
      [
        'chart',
        'card',
        'panel',
        'contentCard',
        'smallCard',
        'subduedCard',
        'indicatorCard',
        'inset',
        'insetContent',
        'canvasOutline',
        'raisedInset',
        'selectionPanel',
      ].includes(variant) && 'p-4',
      ['empty', 'compactEmpty', 'emptyCaption'].includes(variant) && 'p-6',
      [
        'microFooter',
        'captionFooter',
        'sectionStart',
        'strongSectionStart',
      ].includes(variant) && 'pt-3',
      ['sectionEnd', 'strongSectionEnd'].includes(variant) && 'pb-3',
      [
        'quietChip',
        'highlightedChip',
        'quietCount',
        'errorCount',
        'warningCount',
        'warningLabel',
      ].includes(variant) && 'px-2 py-1',
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
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
}
