// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell distributes the prepared scope to both allocation and concentration. See SHARED_OWNERSHIP_AUDIT.md.
import { accountFilterId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/accountFilterId'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

export function scopeRawAllocationData(
  rawData: RawIsinData,
  accounts: Set<string>,
): RawIsinData {
  if (accounts.size === 0) return rawData
  const inScope = (row: RawIsinRow) =>
    !!row.account &&
    accounts.has(
      accountFilterId({
        account: row.account,
        account_type: row.account_type,
      }),
    )
  return {
    geo: rawData.geo.filter(inScope),
    secteur: rawData.secteur.filter(inScope),
    currency: rawData.currency.filter(inScope),
    classe: rawData.classe.filter(inScope),
    loading: rawData.loading,
  }
}
