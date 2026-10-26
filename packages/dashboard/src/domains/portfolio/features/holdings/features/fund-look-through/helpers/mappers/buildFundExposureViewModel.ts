import type {
  IssuerExposure,
  SecurityExposure,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel/buildFundHoldingsViewModel.types'
import { buildIssuerExposures } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel/buildIssuerExposures'
import type {
  FundHolding,
  FundHoldingStatus,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function buildFundExposureViewModel({
  expanded,
  holdings,
  positions,
  query,
  sort,
  statuses,
}: BuildFundExposureViewModelInput) {
  const needle = query.trim().toLocaleLowerCase()
  const selectedFundName = needle
    ? (positions.find(
        (position) =>
          position.name.toLocaleLowerCase() === needle &&
          matchesFundStatus(position, statuses),
      )?.name ?? '')
    : ''
  const scopedPositions = selectedFundName
    ? positions.filter((position) => position.name === selectedFundName)
    : positions
  const parentIds = new Set(
    scopedPositions
      .flatMap((position) => [position.isin, position.ticker])
      .filter(Boolean),
  )
  const scopedHoldings = selectedFundName
    ? holdings.filter(
        (holding) =>
          holding.parentName === selectedFundName ||
          parentIds.has(holding.parentIsin) ||
          parentIds.has(holding.parentTicker),
      )
    : holdings
  const exposures = buildIssuerExposures(
    scopedPositions,
    scopedHoldings,
    statuses,
  )
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
  const displayed = [...filtered].toSorted(
    sort === 'value'
      ? (left, right) => right.value - left.value
      : (left, right) => left.name.localeCompare(right.name),
  )
  const rows: ExposureRow[] = displayed.flatMap((issuer) => [
    { kind: 'issuer' as const, issuer, open: expanded.has(issuer.id) },
    ...(expanded.has(issuer.id)
      ? issuer.securities.flatMap((security): ExposureRow[] => [
          { kind: 'security', issuer, security },
          ...(security.sources.length > 1
            ? security.sources.map((source) => ({
                kind: 'source' as const,
                issuer,
                security,
                fund: source.fund,
                value: source.value,
              }))
            : []),
        ])
      : []),
  ])

  return {
    displayed,
    rows,
    securityCount: displayed.reduce(
      (sum, issuer) => sum + issuer.securities.length,
      0,
    ),
    totalIssuerCount: exposures.length,
  }
}

export type FundExposureSort = 'value' | 'name'

export type ExposureRow =
  | { kind: 'issuer'; issuer: IssuerExposure; open: boolean }
  | { kind: 'security'; issuer: IssuerExposure; security: SecurityExposure }
  | {
      kind: 'source'
      issuer: IssuerExposure
      security: SecurityExposure
      fund: string
      value: number
    }

type BuildFundExposureViewModelInput = {
  expanded: Set<string>
  holdings: FundHolding[]
  positions: PositionRow[]
  query: string
  sort: FundExposureSort
  statuses: FundHoldingStatus[]
}

function matchesFundStatus(
  position: PositionRow,
  statuses: FundHoldingStatus[],
): boolean {
  return statuses.some(
    (status) =>
      status.parentId === (position.isin || position.ticker) ||
      (!!position.isin && status.parentIsin === position.isin) ||
      (!!position.ticker && status.parentTicker === position.ticker),
  )
}
