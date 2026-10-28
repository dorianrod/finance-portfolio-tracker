export function shouldAnimateConcentration(
  prefersReducedMotion: boolean,
): boolean {
  return !prefersReducedMotion
}
