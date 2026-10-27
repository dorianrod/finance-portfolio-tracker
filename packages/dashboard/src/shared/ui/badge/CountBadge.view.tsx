import type { HTMLAttributes } from 'react'

import { COUNT_BADGE_TONES } from '@/shared/ui/badgeAppearance/countBadgeTones'

export function CountBadge({
  tone,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'> & {
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
