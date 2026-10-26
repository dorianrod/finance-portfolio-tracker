import type { ReactNode } from 'react'

export function SegmentedControl({
  label,
  children,
  density = 'default',
}: {
  label: string
  children: ReactNode
  density?: 'compact' | 'default'
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex max-w-full rounded-control border border-border bg-surface ${density === 'compact' ? 'p-0.5' : 'p-1'} `}
    >
      {children}
    </div>
  )
}
