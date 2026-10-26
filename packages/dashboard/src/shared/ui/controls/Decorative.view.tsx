import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'
import { TEXT_VARIANTS } from '@/shared/ui/textAppearance/textVariants'

import type { InlineProps } from './controls.types'

export function Decorative({
  tone,
  variant,
  ...props
}: InlineProps & { tone?: TextTone; variant?: keyof typeof TEXT_VARIANTS }) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={
        [tone && TEXT_TONES[tone], variant && TEXT_VARIANTS[variant]]
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}
