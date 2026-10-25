type TooltipAnchor = Pick<DOMRect, 'left' | 'top' | 'bottom'>
type TooltipViewport = { width: number; height: number }

const TOOLTIP_WIDTH = 340

export function getSourcesTooltipStyle(
  anchor: TooltipAnchor,
  sourceCount: number,
  viewport: TooltipViewport,
) {
  const width = Math.min(TOOLTIP_WIDTH, viewport.width - 16)
  const left = Math.max(8, Math.min(anchor.left, viewport.width - width - 8))
  const below = anchor.bottom + 8 + 40 + sourceCount * 24 < viewport.height

  if (below) return { left, width, top: anchor.bottom + 6 }
  return { left, width, bottom: viewport.height - anchor.top + 6 }
}
