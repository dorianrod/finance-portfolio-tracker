import { STATUS_VARIANTS } from '@/shared/ui/statusAppearance'
import { TEXT_ALIGNMENTS } from '@/shared/ui/textAppearance/textAlignments'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

import type { ContentProps } from './controls.types'

export function StatusMessage({
  urgent = false,
  as: Tag = 'p',
  variant = 'plain',
  tone,
  align,
  ...props
}: ContentProps & {
  urgent?: boolean
  as?: 'p' | 'div'
  variant?: keyof typeof STATUS_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
}) {
  return (
    <Tag
      {...props}
      role={urgent ? 'alert' : 'status'}
      className={
        [
          STATUS_VARIANTS[variant],
          tone && TEXT_TONES[tone],
          align && TEXT_ALIGNMENTS[align],
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}
