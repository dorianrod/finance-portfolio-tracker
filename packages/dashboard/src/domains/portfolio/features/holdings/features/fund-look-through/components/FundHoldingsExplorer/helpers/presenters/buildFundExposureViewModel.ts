import type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/fundExposureSort.type'
import type { IssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function buildFundExposureViewModel({
  exposures,
  needle,
  selectedFundName,
  sort,
}: {
  exposures: IssuerExposure[]
  needle: string
  selectedFundName: string
  sort: FundExposureSort
}) {
  const filtered =
    needle && !selectedFundName
      ? exposures.filter(
          (issuer) =>
            issuer.name.toLocaleLowerCase().includes(needle) ||
            issuer.id.toLocaleLowerCase().includes(needle) ||
            issuer.securities.some((security) =>
              security.name.toLocaleLowerCase().includes(needle),
            ) ||
            issuer.funds.some((fund) =>
              fund.toLocaleLowerCase().includes(needle),
            ),
        )
      : exposures
  const displayed = filtered.toSorted(
    sort === 'value'
      ? (left, right) => right.value - left.value
      : (left, right) => left.name.localeCompare(right.name),
  )

  return {
    displayed,
    securityCount: displayed.reduce(
      (sum, issuer) => sum + issuer.securities.length,
      0,
    ),
    totalIssuerCount: exposures.length,
  }
}
