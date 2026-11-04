import type { ReactNode } from 'react'

import { layoutShare } from '@/shared/ui/layoutGeometry'

export function Proportion({
  value,
  total = 100,
  children,
}: {
  value: number
  total?: number
  children: ReactNode
}) {
  return (
    <div className="h-full" style={{ width: `${layoutShare(value, total)}%` }}>
      {children}
    </div>
  )
}
