import type { PieLabelRenderProps } from 'recharts'

import type { ChartShapeProps } from '@/shared/ui/chartShape'

import type { AccountTypePoint } from '../../../../types/accountTypePoint.type'
import { getAccountTypeLeaderLine } from './getAccountTypeLeaderLine'
import { resolveAccountTypeLabelPositions } from './resolveAccountTypeLabelPositions'

export function resolveAccountTypeLabel(
  data: AccountTypePoint[],
  props: Partial<ChartShapeProps<PieLabelRenderProps, AccountTypePoint>>,
) {
  const { cx, cy, midAngle, outerRadius, payload, index } = props
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof index !== 'number' ||
    !payload
  )
    return null
  const point = payload
  const position = resolveAccountTypeLabelPositions(data, cx, cy, outerRadius)[
    index
  ]
  if (position == null) return null

  const leaderLine = getAccountTypeLeaderLine(
    cx,
    cy,
    midAngle,
    outerRadius,
    position,
  )

  return { point, position, leaderLine }
}
