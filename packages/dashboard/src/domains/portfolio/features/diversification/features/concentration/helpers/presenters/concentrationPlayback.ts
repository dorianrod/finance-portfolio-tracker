export function nextPlaybackIndex(
  index: number,
  frameCount: number,
): {
  index: number
  complete: boolean
} {
  if (frameCount <= 0 || index >= frameCount - 1)
    return { index: Math.max(0, index), complete: true }
  const nextIndex = index + 1
  return { index: nextIndex, complete: nextIndex >= frameCount - 1 }
}

export function shouldAnimateConcentration(
  prefersReducedMotion: boolean,
): boolean {
  return !prefersReducedMotion
}
