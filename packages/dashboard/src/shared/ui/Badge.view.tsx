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
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone: BadgeTone }) {
  return (
    <span
      {...props}
      className={[BADGE_BASE, BADGE_TONES[tone], className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

function BadgeDetail(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={['font-normal opacity-80', props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

Badge.Detail = BadgeDetail

export function CountBadge({
  tone,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone: keyof typeof COUNT_BADGE_TONES }) {
  return (
    <span
      {...props}
      className={[
        'rounded-full text-[10px] font-semibold',
        COUNT_BADGE_TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function MetricDelta({
  tone,
  variant = 'summary',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone: TextTone
  variant?: keyof typeof DELTA_VARIANTS
}) {
  return (
    <span
      {...props}
      className={[DELTA_VARIANTS[variant], TEXT_TONES[tone], className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

function MetricDeltaDetail(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={['font-medium opacity-75', props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

MetricDelta.Detail = MetricDeltaDetail

export function SelectionCount({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={[
        'rounded-full bg-accent-solid text-center text-[10px] font-bold leading-4 text-content',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
