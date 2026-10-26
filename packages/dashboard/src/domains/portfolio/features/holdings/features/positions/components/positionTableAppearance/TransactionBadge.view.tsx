import type { HTMLAttributes } from 'react'

import { InlineBadge } from '@/shared/ui/tableRow/InlineBadge.view'

export function TransactionBadge({
  kind,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'> & {
  kind: 'buy' | 'sell' | 'other'
}) {
  const tones = {
    buy: 'accent',
    sell: 'attention',
    other: 'decorative',
  } as const
  return <InlineBadge {...props} tone={tones[kind]} />
}
