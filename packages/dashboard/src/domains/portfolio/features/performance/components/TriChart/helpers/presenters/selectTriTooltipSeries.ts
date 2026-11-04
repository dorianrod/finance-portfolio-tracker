import type { NumericTooltipPayload } from '@/shared/ui/chartTooltip'

import type { TriChartPoint } from '../../types/triChartPoint.type'

export function selectTriTooltipSeries(payload: Payload) {
  const tri1y = seriesValue(payload, 'tri_rolling_1y')
  const tri1yBackfill = seriesValue(payload, 'tri_rolling_1y_backfill')
  const tri3y = seriesValue(payload, 'tri_rolling_3y')
  const tri3yBackfill = seriesValue(payload, 'tri_rolling_3y_backfill')
  const showTri1y = tri1y !== null || tri1yBackfill !== null
  const showTri3y = tri3y !== null || tri3yBackfill !== null
  return { tri1y, tri3y, showTri1y, showTri3y }
}

type Payload = ReadonlyArray<NumericTooltipPayload<TriChartPoint>>

function seriesValue(payload: Payload, key: string) {
  return payload.find((point) => point.dataKey === key)?.value ?? null
}
