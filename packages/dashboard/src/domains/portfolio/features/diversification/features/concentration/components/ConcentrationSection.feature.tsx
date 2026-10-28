import { useState } from 'react'

import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import type { DiversificationView } from '@/domains/portfolio/features/diversification/shared/types/diversificationView.type'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'

import { CurrentConcentration } from './CurrentConcentration/CurrentConcentration.feature'
import { HistoricalConcentration } from './HistoricalConcentration.feature'

export function ConcentrationSection({
  view,
  ...inputs
}: Omit<DiversificationInputs, 'rawData'> & { view: DiversificationView }) {
  const [mode, setMode] = useState<ConcentrationMode>('held')
  return view === 'current' ? (
    <CurrentConcentration
      positions={inputs.positions}
      fundHoldings={inputs.fundHoldings}
      dateTo={inputs.dateTo}
      concentrationMode={mode}
      onModeChange={setMode}
    />
  ) : (
    <HistoricalConcentration
      rawPositions={inputs.rawPositions}
      fundHoldingsHistory={inputs.fundHoldingsHistory}
      accountFilters={inputs.accountFilters}
      accountTypeFilters={inputs.accountTypeFilters}
      dateFrom={inputs.dateFrom}
      dateTo={inputs.dateTo}
    />
  )
}
