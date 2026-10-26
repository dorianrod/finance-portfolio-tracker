import { type ComponentPropsWithoutRef, createElement } from 'react'

import { TEXT_ALIGNMENTS } from '@/shared/ui/textAppearance/textAlignments'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'
import { TEXT_VARIANTS } from '@/shared/ui/textAppearance/textVariants'
import { TEXT_WRAPPING } from '@/shared/ui/textAppearance/textWrapping'

export function Text<T extends TextTag = 'span'>({
  as,
  variant = 'inherit',
  tone,
  align,
  wrap,
  numeric = false,
  truncate = false,
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
      truncate && as !== 'td' && as !== 'th' && 'block',
    ]
      .filter(Boolean)
      .join(' '),
  })
}

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

export type TextProps<T extends TextTag> = Omit<
  ComponentPropsWithoutRef<T>,
  'className'
> & {
  as?: T
  variant?: keyof typeof TEXT_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
  wrap?: keyof typeof TEXT_WRAPPING
  numeric?: boolean
  truncate?: boolean
}
