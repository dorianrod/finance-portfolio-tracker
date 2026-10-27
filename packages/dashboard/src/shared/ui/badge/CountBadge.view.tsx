import type { HTMLAttributes } from 'react'

import { COUNT_BADGE_TONES } from '@/shared/ui/badgeAppearance/countBadgeTones'
import type { ControlProps } from '@/shared/ui/controlProps'

export function CountBadge({
  tone,
  ...props
}: ControlProps<HTMLAttributes<HTMLSpanElement>> & {
  tone: keyof typeof COUNT_BADGE_TONES
}) {
  return (
    <span
      {...props}
      className={[
        'rounded-full text-[10px] font-semibold',
        COUNT_BADGE_TONES[tone],
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
