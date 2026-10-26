import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'

import { SEMANTIC_BADGE_CLASSES } from '@/shared/theme/semanticColors'

export function PositionRowSurface({
  kind,
  closed,
  className,
  ...props
}: ComponentPropsWithoutRef<'tr'> & {
  kind: 'position' | 'group' | 'detail'
  closed: boolean
}) {
  return (
    <tr
      {...props}
      className={[
        'border-b border-border transition-colors',
        closed && 'opacity-40 hover:opacity-70',
        kind === 'position' &&
          !closed &&
          'cursor-pointer bg-surface hover:bg-surface-raised',
        kind === 'group' &&
          !closed &&
          'bg-surface-raised cursor-pointer hover:bg-surface-raised',
        (kind === 'position' || kind === 'group') &&
          closed &&
          'cursor-pointer bg-canvas',
        kind === 'detail' && 'bg-canvas',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
export function TransactionBadge({
  kind,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { kind: 'buy' | 'sell' | 'other' }) {
  const tone = {
    buy: SEMANTIC_BADGE_CLASSES.transactionBuy,
    sell: SEMANTIC_BADGE_CLASSES.transactionSell,
    other: SEMANTIC_BADGE_CLASSES.transactionOther,
  }[kind]
  return (
    <span
      {...props}
      className={['font-mono text-xs px-1.5 py-0.5 rounded', tone, className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
export function StripedRow({
  shaded,
  className,
  ...props
}: ComponentPropsWithoutRef<'tr'> & { shaded: boolean }) {
  return (
    <tr
      {...props}
      className={[
        'border-b border-border/50',
        shaded && 'bg-surface-raised/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
