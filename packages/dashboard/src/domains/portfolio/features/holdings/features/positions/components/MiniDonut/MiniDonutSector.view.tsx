import type { PieSectorShapeProps } from 'recharts'

import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

export function MiniDonutSector(
  shapeProps: ChartShapeProps<PieSectorShapeProps, PieEntry>,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return (
    <AllocationCategory.Sector
      geometry={shapeProps}
      category={entry.name}
      aggregate={(entry.subItems?.length ?? 0) > 1}
    />
  )
}
