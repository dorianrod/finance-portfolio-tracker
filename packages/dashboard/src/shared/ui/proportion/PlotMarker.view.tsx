import type { ReactNode } from 'react'

import { layoutShare } from '@/shared/ui/layoutGeometry'

export function PlotMarker({
  value,
  total = 100,
  children,
}: {
  value: number
  total?: number
  children: ReactNode
}) {
  return (
    <span
      className="absolute -top-1 h-4 w-0.5"
      style={{ left: `${layoutShare(value, total)}%` }}
    >
      {children}
    </span>
  )
}
