import { getPieLabelPosition } from './getPieLabelPosition'

export function resolvePieLabel(input: PieLabelInput) {
  if (!hasLabelGeometry(input)) return null
  const { name, value, percent, cx, cy, midAngle, outerRadius } = input
  if (!name || value == null || value === 0) return null
  if (percent == null || percent < 0.025) return null
  return {
    name,
    value,
    percent,
    ...getPieLabelPosition(cx, cy, midAngle, outerRadius),
  }
}

type PieLabelInput = {
  cx?: number
  cy?: number
  midAngle?: number
  outerRadius?: number
  name?: string
  value?: number
  percent?: number
}
type Geometry = {
  cx: number
  cy: number
  midAngle: number
  outerRadius: number
}

function hasLabelGeometry(
  input: PieLabelInput,
): input is PieLabelInput & Geometry {
  return (
    input.cx != null &&
    input.cy != null &&
    input.midAngle != null &&
    input.outerRadius != null &&
    input.outerRadius !== 0
  )
}
