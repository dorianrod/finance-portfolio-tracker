import type { ReactNode } from 'react'

export function VirtualRow({
  height,
  offset,
  children,
}: {
  height: number
  offset: number
  children: ReactNode
}) {
  return (
    <div
      className="absolute left-0 top-0 w-full"
      style={{ height, transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  )
}
