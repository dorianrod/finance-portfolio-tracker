export function seriesFill(gradientId?: string) {
  return gradientId ? `url(#${gradientId})` : 'none'
}
