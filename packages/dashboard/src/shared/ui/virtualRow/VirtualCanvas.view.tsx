import type { ReactNode, Ref } from 'react'

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
