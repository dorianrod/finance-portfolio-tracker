import type { HTMLAttributes } from 'react'

export function SelectionCount({
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'>) {
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
