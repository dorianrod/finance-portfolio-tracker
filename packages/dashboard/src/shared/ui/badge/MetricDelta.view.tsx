import type { HTMLAttributes } from 'react'

import { DELTA_VARIANTS } from '@/shared/ui/badgeAppearance/deltaVariants'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

export function MetricDelta({
  tone,
  variant = 'summary',
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'> & {
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
  props: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'>,
) {
  return (
    <span
      {...props}
      className={['font-medium opacity-75'].filter(Boolean).join(' ')}
    />
  )
}

MetricDelta.Detail = MetricDeltaDetail
