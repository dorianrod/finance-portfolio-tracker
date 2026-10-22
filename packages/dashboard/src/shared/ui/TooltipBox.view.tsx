import type { CSSProperties, ReactNode } from 'react'

interface TooltipBoxProps {
  children: ReactNode
  className?: string
  background?: string
  border?: string
  padding?: string
  minWidth?: number
  maxWidth?: number
}

// Shared dark tooltip box: a `className` (Tailwind, theme-reactive via CSS
// custom properties) renders as-is; otherwise falls back to the inline
// `--tooltip-*` CSS vars used by most recharts tooltips.
export function TooltipBox({ children, className, background, border, padding = '8px 12px', minWidth, maxWidth }: TooltipBoxProps) {
  if (className) return <div className={className}>{children}</div>

  const style: CSSProperties = {
    background: background ?? 'var(--tooltip-bg)',
    border: `1px solid ${border ?? 'var(--tooltip-border)'}`,
    borderRadius: 8,
    padding,
    fontSize: 12,
    minWidth,
    maxWidth,
  }
  return <div style={style}>{children}</div>
}
