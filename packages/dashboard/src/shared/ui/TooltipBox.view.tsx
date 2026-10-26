import type { CSSProperties, ReactNode } from 'react'

type TooltipBoxProps = {
  children: ReactNode
  className?: string
  variant?: 'theme' | 'raised'
  padding?: string
  minWidth?: number
  maxWidth?: number
}

export function TooltipBox({
  children,
  className,
  variant = 'theme',
  padding,
  minWidth,
  maxWidth,
}: TooltipBoxProps) {
  if (variant === 'raised')
    return (
      <div
        className={[
          'bg-surface-raised border border-border-strong rounded-lg text-xs shadow-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ padding, minWidth, maxWidth }}
      >
        {children}
      </div>
    )

  const style: CSSProperties = {
    background: 'var(--tooltip-bg)',
    border: '1px solid var(--tooltip-border)',
    borderRadius: 8,
    padding: padding ?? '8px 12px',
    fontSize: 12,
    minWidth,
    maxWidth,
  }
  return (
    <div style={style} className={className}>
      {children}
    </div>
  )
}
