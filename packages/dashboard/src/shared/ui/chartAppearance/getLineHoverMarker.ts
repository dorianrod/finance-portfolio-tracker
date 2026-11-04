import { LINE_HOVER_MARKERS } from './lineHoverMarkers'

export function getLineHoverMarker(
  profile: keyof typeof LINE_HOVER_MARKERS | 'series' | undefined,
  color: string,
) {
  if (profile === 'series') return { r: 4, fill: color }
  return profile && LINE_HOVER_MARKERS[profile]
}
