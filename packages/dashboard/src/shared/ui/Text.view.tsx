import { type ComponentPropsWithoutRef, createElement } from 'react'

import {
  TEXT_ALIGNMENTS,
  TEXT_TONES,
  TEXT_VARIANTS,
  TEXT_WRAPPING,
  type TextTone,
} from './textAppearance'

export type TextTag =
  | 'span'
  | 'p'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'strong'
  | 'small'
  | 'code'
  | 'pre'
  | 'label'
  | 'td'
  | 'th'
  | 'dt'
  | 'dd'
  | 'li'

export type TextProps<T extends TextTag> = ComponentPropsWithoutRef<T> & {
  as?: T
  variant?: keyof typeof TEXT_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
  wrap?: keyof typeof TEXT_WRAPPING
  numeric?: boolean
  truncate?: boolean
}

export function Text<T extends TextTag = 'span'>({
  as,
  variant = 'inherit',
  tone,
  align,
  wrap,
  numeric = false,
  truncate = false,
  className,
  ...props
}: TextProps<T>) {
  return createElement(as ?? 'span', {
    ...props,
    className: [
      TEXT_VARIANTS[variant],
      tone && TEXT_TONES[tone],
      align && TEXT_ALIGNMENTS[align],
      wrap && TEXT_WRAPPING[wrap],
      numeric && 'tabular-nums',
      truncate && 'truncate',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  })
}
