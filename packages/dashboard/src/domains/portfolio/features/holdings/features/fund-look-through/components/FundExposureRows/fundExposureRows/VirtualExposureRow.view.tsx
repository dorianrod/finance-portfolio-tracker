import type { ExposureRow } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import { VirtualRow } from '@/shared/ui/virtualRow/VirtualRow.view'

import type { VirtualExposureItem } from './fundExposureRows.types'
import { IssuerRow } from './IssuerRow.view'
import { SecurityRow } from './SecurityRow.view'
import { SourceRow } from './SourceRow.view'

export function VirtualExposureRow({
  item,
  onToggle,
  row,
  scrollMargin,
}: {
  item: VirtualExposureItem
  onToggle: (id: string) => void
  row: ExposureRow
  scrollMargin: number
}) {
  return (
    <VirtualRow height={item.size} offset={item.start - scrollMargin}>
      {row.kind === 'issuer' && (
        <IssuerRow issuer={row.issuer} open={row.open} onToggle={onToggle} />
      )}
      {row.kind === 'security' && <SecurityRow security={row.security} />}
      {row.kind === 'source' && <SourceRow fund={row.fund} value={row.value} />}
    </VirtualRow>
  )
}
