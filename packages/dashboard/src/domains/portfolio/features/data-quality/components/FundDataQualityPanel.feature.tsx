import { useDataQualityFundDiagnostics } from '@/domains/portfolio/features/data-quality/services/actions/useDataQualityFundDiagnostics'
import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/stores/dataQualityPanels.atoms'
import {
  buildFundDiagnosticsRows,
  type FundDiagnosticsFilter,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundDiagnosticsRows'
import type {
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { FundDataQualityPanelView } from './FundDataQualityPanel.view'

type Props = {
  statuses: FundHoldingStatus[]
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
}

export function FundDataQualityPanel({ statuses, holdings, snapshots, unresolved }: Props) {
  const open = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const { closeFundDiagnostics } = useDataQualityFundDiagnostics()
  const [filter, setFilter] = useState<FundDiagnosticsFilter>('issues')
  const rows = useMemo(
    () => buildFundDiagnosticsRows({ filter, holdings, snapshots, statuses, unresolved }),
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
