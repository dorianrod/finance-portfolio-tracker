import { ChartText } from '@/shared/ui/ChartText.view'
import { Inset } from '@/shared/ui/layout/Inset.view'

import { getHoldingLabelGeometry } from './helpers/presenters/getHoldingLabelGeometry'

export function HoldingLabelTick({
  x = 0,
  y = 0,
  payload,
}: HoldingLabelTickProps) {
  const label = String(payload?.value ?? '')

  return (
    <foreignObject
      {...getHoldingLabelGeometry(x, y)}
      style={{ overflow: 'visible' }}
    >
      <ChartText
        as="div"
        tone="tick"
        variant="tickLabel"
        align="right"
        truncate
        title={label}
      >
        <Inset inset="compact">{label}</Inset>
      </ChartText>
    </foreignObject>
  )
}

type HoldingLabelTickProps = {
  x?: number
  y?: number
  payload?: { value?: string | number }
}
