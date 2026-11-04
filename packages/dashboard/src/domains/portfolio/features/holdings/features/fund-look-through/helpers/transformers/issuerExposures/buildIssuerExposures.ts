import type {
  ExposureSource,
  IssuerExposure,
} from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import { indexFundHoldingsByParent } from '@/domains/portfolio/shared/helpers/transformers/indexFundHoldingsByParent'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/transformers/isAssetAnalysisApplicablePosition'
import { isFundPosition } from '@/domains/portfolio/shared/helpers/transformers/isFundPosition'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { createCanonicalIssuerResolver } from './createCanonicalIssuerResolver'

export function buildIssuerExposures(
  positions: PositionRow[],
  holdings: FundHolding[],
  statuses: FundHoldingStatus[] = [],
): IssuerExposure[] {
  const applicablePositions = positions.filter(
    isAssetAnalysisApplicablePosition,
  )
  const byParent = indexFundHoldingsByParent(holdings)

  const canonicalIssuer = createCanonicalIssuerResolver(holdings)

  type MutableSecurity = {
    id: string
    name: string
    value: number
    funds: Map<string | null, number>
  }
  type MutableIssuer = {
    id: string
    name: string
    value: number
    securities: Map<string, MutableSecurity>
    funds: Map<string | null, number>
  }
  const issuers = new Map<string, MutableIssuer>()
  const compositeIds = new Set(
    statuses
      .flatMap((status) => [
        status.parentId,
        status.parentIsin,
        status.parentTicker,
      ])
      .filter(Boolean),
  )
  const total = applicablePositions.reduce(
    (sum, position) => sum + activePositionValue(position),
    0,
  )

  const add = (
    issuerId: string,
    issuerName: string,
    securityId: string,
    securityName: string,
    value: number,
    fundName: string | null,
  ) => {
    const issuer = issuers.get(issuerId) ?? {
      id: issuerId,
      name: issuerName,
      value: 0,
      securities: new Map<string, MutableSecurity>(),
      funds: new Map<string | null, number>(),
    }
    issuer.value += value
    if (fundName !== '')
      issuer.funds.set(fundName, (issuer.funds.get(fundName) ?? 0) + value)
    const security = issuer.securities.get(securityId) ?? {
      id: securityId,
      name: securityName,
      value: 0,
      funds: new Map<string | null, number>(),
    }
    security.value += value
    if (fundName !== '')
      security.funds.set(fundName, (security.funds.get(fundName) ?? 0) + value)
    issuer.securities.set(securityId, security)
    issuers.set(issuerId, issuer)
  }

  for (const position of applicablePositions) {
    addPositionExposures(position, byParent, compositeIds, canonicalIssuer, add)
  }

  return [...issuers.values()]
    .map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
      value: issuer.value,
      weight: total > 0 ? (issuer.value / total) * 100 : 0,
      funds: [...issuer.funds.keys()]
        .filter((fund) => fund !== null)
        .toSorted(),
      sources: buildSources(issuer.funds),
      securities: [...issuer.securities.values()]
        .map((security) => ({
          id: security.id,
          name: security.name,
          value: security.value,
          funds: [...security.funds.keys()]
            .filter((fund) => fund !== null)
            .toSorted(),
          sources: buildSources(security.funds),
        }))
        .toSorted((a, b) => b.value - a.value),
    }))
    .toSorted((a, b) => b.value - a.value)
}

function buildSources(funds: Map<string | null, number>): ExposureSource[] {
  return [...funds]
    .map(([fund, value]) => ({ fund, value }))
    .toSorted((a, b) => b.value - a.value)
}

type AddExposure = (
  issuerId: string,
  issuerName: string,
  securityId: string,
  securityName: string,
  value: number,
  fundName: string | null,
) => void
type IssuerResolver = ReturnType<typeof createCanonicalIssuerResolver>

function activePositionValue(position: PositionRow) {
  return position.status === 'active'
    ? Math.max(0, position.total_value ?? 0)
    : 0
}

function isDirectSecurity(
  id: string,
  position: PositionRow,
  compositeIds: Set<string>,
) {
  return Boolean(id) && !compositeIds.has(id) && !isFundPosition(position)
}

function addPositionExposures(
  position: PositionRow,
  byParent: Map<string, FundHolding[]>,
  compositeIds: Set<string>,
  canonicalIssuer: IssuerResolver,
  add: AddExposure,
) {
  const positionValue = activePositionValue(position)
  if (positionValue <= 0) return
  const fundRows = byParent.get(position.isin) ?? byParent.get(position.ticker)
  if (fundRows != null && fundRows.length > 0) {
    addFundIssuerExposures(
      fundRows,
      positionValue,
      position.name,
      canonicalIssuer,
      add,
    )
    return
  }
  const directId = position.isin || position.ticker
  if (isDirectSecurity(directId, position, compositeIds)) {
    add(directId, position.name, directId, position.name, positionValue, null)
  }
}

function addFundIssuerExposures(
  fundRows: FundHolding[],
  positionValue: number,
  fundName: string,
  canonicalIssuer: IssuerResolver,
  add: AddExposure,
) {
  const totalWeight = fundRows.reduce((sum, row) => sum + row.weight, 0)
  const scale = totalWeight > 1 ? 1 / totalWeight : 1
  for (const holding of fundRows) {
    const issuer = canonicalIssuer(holding.issuerId || holding.holdingId)
    add(
      issuer.id,
      issuer.name || holding.issuerName || holding.holdingName,
      holding.holdingId,
      holding.holdingName,
      positionValue * holding.weight * scale,
      fundName,
    )
  }
}
