import { useMemo } from 'react'

import { buildCumulativeConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/concentrationCalculations/buildCumulativeConcentration'
import { computeConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/concentrationCalculations/computeConcentration'
import { computeHeldAssetConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/concentrationCalculations/computeHeldAssetConcentration'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useCurrentConcentration(
  positions: PositionRow[],
  fundHoldings: FundHolding[],
  mode: ConcentrationMode,
) {
  const lookThroughConcentration = useMemo(
    () => computeConcentration(positions, fundHoldings),
    [positions, fundHoldings],
  )
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(positions),
    [positions],
  )
  const concentration =
    mode === 'held' ? heldAssetConcentration : lookThroughConcentration
  const cumulativeConcentration = useMemo(
    () => buildCumulativeConcentration(concentration.allHoldings),
    [concentration],
  )
  return useMemo(
    () => ({
      lookThroughConcentration,
      heldAssetConcentration,
      concentration,
      cumulativeConcentration,
    }),
    [
      lookThroughConcentration,
      heldAssetConcentration,
      concentration,
      cumulativeConcentration,
    ],
  )
}
