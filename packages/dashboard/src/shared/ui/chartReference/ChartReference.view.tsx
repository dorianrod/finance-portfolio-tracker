import type { ComponentProps } from 'react'
import { ReferenceLine } from 'recharts'

import { REFERENCE_APPEARANCES } from '@/shared/ui/chartAppearance/referenceAppearances'

export function ChartReference({
  kind = 'zero',
  ...props
}: ChartReferenceProps) {
  return <ReferenceLine {...props} {...REFERENCE_APPEARANCES[kind]} />
}

type ReferenceDataKeys =
  | 'x'
  | 'y'
  | 'segment'
  | 'xAxisId'
  | 'yAxisId'
  | 'ifOverflow'
  | 'position'
  | 'id'
  | 'style'

type ChartReferenceProps = Pick<
  ComponentProps<typeof ReferenceLine>,
  Extract<keyof ComponentProps<typeof ReferenceLine>, ReferenceDataKeys>
> & {
  kind?: keyof typeof REFERENCE_APPEARANCES
}
