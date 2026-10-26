import type { ReactNode } from 'react'

import { Inline } from '@/shared/ui/layout/Inline.view'

export function KpiCard({ children }: { children: ReactNode }) {
  return (
    <Inline as="div" sizing="flexible" inset="compact">
      {children}
    </Inline>
  )
}
