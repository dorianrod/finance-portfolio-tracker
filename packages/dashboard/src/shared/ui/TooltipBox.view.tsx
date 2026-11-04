import type { ReactNode } from 'react'

import { TOOLTIP_DENSITIES } from '@/shared/ui/layoutAppearance/tooltipDensities'
import { TOOLTIP_SIZES } from '@/shared/ui/layoutAppearance/tooltipSizes'

export function TooltipBox({
  children,
  variant = 'theme',
  density = 'default',
  size = 'default',
}: TooltipBoxProps) {
  return (
    <div
      className={[
        TOOLTIP_SIZES[size],
        'max-w-[calc(100vw-2rem)] rounded-lg text-xs',
        variant === 'raised' &&
          'bg-surface-raised border border-border-strong shadow-xl',
        TOOLTIP_DENSITIES[density],
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        variant === 'theme'
          ? {
              background: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

type TooltipBoxProps = {
  children: ReactNode
  variant?: 'theme' | 'raised'
  density?: 'compact' | 'default' | 'spacious'
  size?: keyof typeof TOOLTIP_SIZES
}
