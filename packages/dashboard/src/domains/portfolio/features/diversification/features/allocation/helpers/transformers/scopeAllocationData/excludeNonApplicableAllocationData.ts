import { accountFilterId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/accountFilterId'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/transformers/isAssetAnalysisApplicablePosition'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

export function excludeNonApplicableAllocationData(
  rawData: RawIsinData,
  positions: PositionRow[],
): RawIsinData {
  const excludedAccounts = new Set(
    positions
      .filter((position) => !isAssetAnalysisApplicablePosition(position))
      .map(accountFilterId),
  )
  if (excludedAccounts.size === 0) return rawData
  const isApplicable = (row: RawIsinRow) =>
    !row.account ||
    !excludedAccounts.has(
      accountFilterId({
        account: row.account,
        account_type: row.account_type,
      }),
    )
  return {
    geo: rawData.geo.filter(isApplicable),
    secteur: rawData.secteur.filter(isApplicable),
    currency: rawData.currency.filter(isApplicable),
    classe: rawData.classe.filter(isApplicable),
    loading: rawData.loading,
  }
}
