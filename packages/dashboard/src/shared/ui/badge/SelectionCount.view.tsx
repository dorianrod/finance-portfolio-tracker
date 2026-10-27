import type { HTMLAttributes } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'

export function SelectionCount({
  ...props
}: ControlProps<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...props}
      className={[
        'rounded-full bg-accent-solid text-center text-[10px] font-bold leading-4 text-content',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
