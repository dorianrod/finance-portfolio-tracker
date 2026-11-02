import type { BarShapeProps } from 'recharts'

export function hasRectangleGeometry(
  geometry: Partial<RectangleGeometry>,
): geometry is Required<RectangleGeometry> {
  return (
    geometry.x != null &&
    geometry.y != null &&
    geometry.width != null &&
    geometry.height != null
  )
}

type RectangleGeometry = Pick<BarShapeProps, 'x' | 'y' | 'width' | 'height'>
