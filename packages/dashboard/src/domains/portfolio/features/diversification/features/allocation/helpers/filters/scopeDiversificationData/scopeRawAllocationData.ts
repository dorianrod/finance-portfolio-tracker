import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
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
