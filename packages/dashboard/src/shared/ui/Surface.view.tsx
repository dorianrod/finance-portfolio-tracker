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

type SurfaceProps<T extends SurfaceTag> = Omit<
  ComponentPropsWithoutRef<T>,
  'className'
> & {
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
        'qualityCard',
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
