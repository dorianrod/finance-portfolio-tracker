import type { HTMLAttributes } from 'react'

import { BADGE_BASE } from '@/shared/ui/badgeAppearance/badgeBase'
import { BADGE_TONES } from '@/shared/ui/badgeAppearance/badgeTones'
import type { ControlProps } from '@/shared/ui/controlProps'

import type { BadgeTone } from './badge.types'

export function Badge({
  tone,
  ...props
}: ControlProps<HTMLAttributes<HTMLSpanElement>> & {
  tone: BadgeTone
}) {
  return (
    <span
      {...props}
      className={[BADGE_BASE, BADGE_TONES[tone]].filter(Boolean).join(' ')}
    />
  )
}

function BadgeDetail(props: ControlProps<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...props}
      className={['font-normal opacity-80'].filter(Boolean).join(' ')}
    />
  )
}

Badge.Detail = BadgeDetail
