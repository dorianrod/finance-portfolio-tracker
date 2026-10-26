import type { ReactNode } from 'react'

import { layoutShare } from './layoutGeometry'

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
