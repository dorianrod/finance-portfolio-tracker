import type { HTMLAttributes } from 'react'

import { BADGE_BASE } from '@/shared/ui/badgeAppearance/badgeBase'
import { BADGE_TONES } from '@/shared/ui/badgeAppearance/badgeTones'

import type { BadgeTone } from './badge.types'

export function Badge({
  tone,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & { tone: BadgeTone }) {
  return (
    <span
      {...props}
      className={[BADGE_BASE, BADGE_TONES[tone]].filter(Boolean).join(' ')}
    />
  )
}

function BadgeDetail(
  props: Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
) {
  return (
    <span
      {...props}
      className={['font-normal opacity-80'].filter(Boolean).join(' ')}
    />
  )
}

Badge.Detail = BadgeDetail
