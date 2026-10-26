import type { ReactNode, Ref } from 'react'

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

export function VirtualCanvas({
  height,
  children,
  ref,
}: {
  height: number
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div ref={ref} className="relative" style={{ height }}>
      {children}
    </div>
  )
}
