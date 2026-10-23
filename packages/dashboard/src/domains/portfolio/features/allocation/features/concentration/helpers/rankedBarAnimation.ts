import type {
  AnimationInterpolateFn,
  AnimationItem,
  BarRectangleItem,
  CartesianLayout,
} from 'recharts'

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

function rectangleFor(item: AnimationItem<BarRectangleItem>): BarRectangleItem {
  return item.status === 'removed' ? item.prev : item.next
}

/**
 * Keeps ranked bars at their current width while they enter or leave, so a
 * date change reads as a reordering rather than a fresh chart reveal.
 */
export const interpolateRankedBars: AnimationInterpolateFn<BarRectangleItem, CartesianLayout> = (
  items,
  progress,
) => {
  if (!items?.length) return []

  const rectangles = items.map(rectangleFor)
  const rowStep = Math.max(30, ...rectangles.map((rectangle) => rectangle.height + 6))
  const exitStart = Math.max(...rectangles.map((rectangle) => rectangle.y + rectangle.height)) + rowStep
  let addedIndex = 0
  let removedIndex = 0

  return items.flatMap((item) => {
    if (item.status === 'matched') {
      return [{
        ...item.next,
        x: interpolate(item.prev.x, item.next.x, progress),
        y: interpolate(item.prev.y, item.next.y, progress),
        width: interpolate(item.prev.width, item.next.width, progress),
        height: interpolate(item.prev.height, item.next.height, progress),
      }]
    }

    if (item.status === 'added') {
      const startY = exitStart + addedIndex * rowStep
      addedIndex += 1
      return [{
        ...item.next,
        y: interpolate(startY, item.next.y, progress),
        opacity: progress,
      }]
    }

    if (progress >= 1) return []
    const targetY = exitStart + removedIndex * rowStep
    removedIndex += 1
    return [{
      ...item.prev,
      y: interpolate(item.prev.y, targetY, progress),
      opacity: 1 - progress,
    }]
  })
}
