import type { HTMLAttributes } from 'react'

import {
  BADGE_BASE,
  BADGE_TONES,
  COUNT_BADGE_TONES,
  DELTA_VARIANTS,
} from './badgeAppearance'
import { TEXT_TONES, type TextTone } from './textAppearance'

export type BadgeTone = keyof typeof BADGE_TONES

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

export function CountBadge({
  tone,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & {
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

export function MetricDelta({
  tone,
  variant = 'summary',
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & {
  tone: TextTone
  variant?: keyof typeof DELTA_VARIANTS
}) {
  return (
    <span
      {...props}
      className={[DELTA_VARIANTS[variant], TEXT_TONES[tone]]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

function MetricDeltaDetail(
  props: Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
) {
  return (
    <span
      {...props}
      className={['font-medium opacity-75'].filter(Boolean).join(' ')}
    />
  )
}

MetricDelta.Detail = MetricDeltaDetail

export function SelectionCount({
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'>) {
  return (
    <span
      {...props}
      className={[
        'rounded-full bg-accent-solid text-center text-[10px] font-bold leading-4 text-content',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
