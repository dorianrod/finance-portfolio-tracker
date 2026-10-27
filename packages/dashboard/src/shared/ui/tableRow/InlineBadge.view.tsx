import type { HTMLAttributes } from 'react'

export function InlineBadge({
  tone,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'> & {
  tone: 'accent' | 'attention' | 'decorative'
}) {
  const appearance = {
    accent: 'bg-accent-muted text-accent',
    attention: 'bg-attention-muted text-attention',
    decorative: 'bg-decorative-muted text-decorative',
  }[tone]
  return (
    <span
      {...props}
      className={['font-mono text-xs px-1.5 py-0.5 rounded', appearance].join(
        ' ',
      )}
    />
  )
}
