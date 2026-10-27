import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import {
  buildFundDiagnosticsRows,
  type FundDiagnosticsFilter,
} from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildFundDiagnosticsRows'
import { useDataQualityFundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/services/actions/useDataQualityFundDiagnostics'
import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityFundDiagnosticsOpenAtom'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

import { FundDataQualityPanelView } from './FundDataQualityPanel.view'

export function FundDataQualityPanel({
  statuses,
  holdings,
  snapshots,
  unresolved,
}: Props) {
  const open = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const { closeFundDiagnostics } = useDataQualityFundDiagnostics()
  const [filter, setFilter] = useState<FundDiagnosticsFilter>('issues')
  const rows = useMemo(
    () =>
      buildFundDiagnosticsRows({
        filter,
        holdings,
        snapshots,
        statuses,
        unresolved,
      }),
    [filter, holdings, snapshots, statuses, unresolved],
  )
  return (
    <FundDataQualityPanelView
      open={open}
      onClose={closeFundDiagnostics}
      filter={filter}
      onSelect={setFilter}
      rows={rows}
    />
  )
}

type Props = {
  statuses: FundHoldingStatus[]
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
}
