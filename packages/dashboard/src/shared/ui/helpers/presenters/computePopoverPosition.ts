export function computePopoverPosition(
  rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'height'>,
  preferredWidth: number,
  preferredHeight: number,
  viewport: { width: number; height: number },
): { top: number; left: number; width: number; maxHeight: number } {
  const margin = 10
  const width = Math.min(
    preferredWidth,
    Math.max(0, viewport.width - margin * 2),
  )
  const maxHeight = Math.max(0, viewport.height - margin * 2)
  const height = Math.min(preferredHeight, maxHeight)
  let left = rect.right + margin
  if (left + width > viewport.width - margin) left = rect.left - width - margin
  left = Math.max(margin, Math.min(left, viewport.width - width - margin))
  const top = Math.max(
    margin,
    Math.min(
      rect.top + rect.height / 2 - height / 2,
      viewport.height - height - margin,
    ),
  )
  return { top, left, width, maxHeight }
}
