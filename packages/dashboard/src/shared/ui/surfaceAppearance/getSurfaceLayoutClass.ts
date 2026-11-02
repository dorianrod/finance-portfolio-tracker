import type { SURFACE_VARIANTS } from './surfaceVariants'

export function getSurfaceLayoutClass(
  as: string | undefined,
  variant: keyof typeof SURFACE_VARIANTS,
) {
  if (as === 'span') {
    if (variant === 'overlay') return 'block h-full w-full'
    if (variant === 'statusFrame' || variant === 'statusCanvasFrame')
      return 'grid size-full place-items-center'
    return 'inline-flex h-full'
  }
  switch (as) {
    case 'table':
      return 'w-full'
    case 'thead':
      return 'sticky top-0 z-10'
    case 'tr':
    case 'tbody':
    case 'td':
      return ''
    case undefined:
    default:
      return 'block h-full'
  }
}
