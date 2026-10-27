import { getTextTruncationClassName } from './getTextTruncationClassName'
import { TEXT_ALIGNMENTS } from './textAlignments'
import type { TextTone } from './textAppearance.types'
import { TEXT_TONES } from './textTones'
import { TEXT_VARIANTS } from './textVariants'
import { TEXT_WRAPPING } from './textWrapping'

export function getTextClassName({
  as,
  variant = 'inherit',
  tone,
  align,
  wrap,
  numeric,
  truncate,
}: TextAppearance) {
  return [
    TEXT_VARIANTS[variant],
    tone && TEXT_TONES[tone],
    align && TEXT_ALIGNMENTS[align],
    wrap && TEXT_WRAPPING[wrap],
    numeric && 'tabular-nums',
    getTextTruncationClassName(as, truncate),
  ]
    .filter(Boolean)
    .join(' ')
}

export type TextAppearance = {
  as?: string
  variant?: keyof typeof TEXT_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
  wrap?: keyof typeof TEXT_WRAPPING
  numeric?: boolean
  truncate?: boolean
}
