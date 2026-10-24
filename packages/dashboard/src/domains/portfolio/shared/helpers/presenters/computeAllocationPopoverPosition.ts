export function computeAllocationPopoverPosition(
  rect: DOMRect,
  width: number,
  height: number,
): { top: number; left: number } {
  const margin = 10
  let left = rect.right + margin
  let top = rect.top + rect.height / 2 - height / 2
  if (left + width > window.innerWidth - margin)
    left = rect.left - width - margin
  if (left < margin) left = margin
  if (top < margin) top = margin
  if (top + height > window.innerHeight - margin)
    top = window.innerHeight - height - margin
  return { top, left }
}
