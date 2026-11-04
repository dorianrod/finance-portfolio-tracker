import type { ReactNode } from 'react'

export function TreeIndent({
  depth,
  children,
}: {
  depth: number
  children: ReactNode
}) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ paddingLeft: Math.max(0, depth) * 20 }}
    >
      {children}
    </span>
  )
}
