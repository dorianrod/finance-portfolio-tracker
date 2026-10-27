import type { IssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/issuerExposures/buildFundHoldingsViewModel.types'
import { isFundPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel/isFundPosition'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import { indexFundHoldingsByParent } from '@/domains/portfolio/shared/helpers/selectors/indexFundHoldingsByParent'
import type {
  FundHolding,
  FundHoldingStatus,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'

// eslint-disable-next-line complexity -- Canonical issuers and source funds share one accumulation pass; splitting would distribute the same mutable ledger.
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
    funds: Map<string, number>
  }
  type MutableIssuer = {
    id: string
    name: string
    value: number
    securities: Map<string, MutableSecurity>
    funds: Map<string, number>
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
    (sum, position) =>
      position.status === 'active'
        ? sum + Math.max(0, position.total_value ?? 0)
        : sum,
    0,
  )

  const add = (
    issuerId: string,
    issuerName: string,
    securityId: string,
    securityName: string,
    value: number,
    fundName: string,
  ) => {
    const issuer = issuers.get(issuerId) ?? {
      id: issuerId,
      name: issuerName,
      value: 0,
      securities: new Map<string, MutableSecurity>(),
      funds: new Map<string, number>(),
    }
    issuer.value += value
    if (fundName)
      issuer.funds.set(fundName, (issuer.funds.get(fundName) ?? 0) + value)
    const security = issuer.securities.get(securityId) ?? {
      id: securityId,
      name: securityName,
      value: 0,
      funds: new Map<string, number>(),
    }
    security.value += value
    if (fundName)
      security.funds.set(fundName, (security.funds.get(fundName) ?? 0) + value)
    issuer.securities.set(securityId, security)
    issuers.set(issuerId, issuer)
  }

  for (const position of applicablePositions) {
    const positionValue =
      position.status === 'active' ? Math.max(0, position.total_value ?? 0) : 0
    if (positionValue <= 0) continue
    const fundRows =
      byParent.get(position.isin) ?? byParent.get(position.ticker)
    if (fundRows != null && fundRows.length > 0) {
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
          position.name,
        )
      }
      continue
    }
    const directId = position.isin || position.ticker
    if (directId && !compositeIds.has(directId) && !isFundPosition(position)) {
      add(
        directId,
        position.name,
        directId,
        position.name,
        positionValue,
        i18n.t('ui.buildfundholdingsviewmodel.direct'),
      )
    }
  }

  return [...issuers.values()]
    .map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
      value: issuer.value,
      weight: total > 0 ? (issuer.value / total) * 100 : 0,
      funds: [...issuer.funds.keys()].toSorted(),
      sources: [...issuer.funds]
        .map(([fund, value]) => ({ fund, value }))
        .toSorted((a, b) => b.value - a.value),
      securities: [...issuer.securities.values()]
        .map((security) => ({
          id: security.id,
          name: security.name,
          value: security.value,
          funds: [...security.funds.keys()].toSorted(),
          sources: [...security.funds]
            .map(([fund, value]) => ({ fund, value }))
            .toSorted((a, b) => b.value - a.value),
        }))
        .toSorted((a, b) => b.value - a.value),
    }))
    .toSorted((a, b) => b.value - a.value)
}

function createCanonicalIssuerResolver(holdings: FundHolding[]) {
  // Some official files truncate long issuer names while others spell them
  // out. Merge only strong normalized-prefix matches; market identifiers
  // (ISIN-like values) remain authoritative and are never fuzzily merged.
  const issuerNames = new Map<string, string>()
  for (const holding of holdings)
    issuerNames.set(holding.issuerId, holding.issuerName)
  const normalizedIssuerIds = [...issuerNames.keys()].filter(
    (id) => !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(id),
  )
  const canonicalIssuerById = new Map<string, string>()
  for (const id of normalizedIssuerIds) {
    const matches = normalizedIssuerIds.filter(
      (candidate) =>
        Math.min(candidate.length, id.length) >= 12 &&
        (candidate.startsWith(id) || id.startsWith(candidate)),
    )
    canonicalIssuerById.set(
      id,
      matches.toSorted((a, b) => b.length - a.length)[0] ?? id,
    )
  }
  const canonicalIssuer = (id: string): { id: string; name: string } => {
    const canonicalId = canonicalIssuerById.get(id) ?? id
    return {
      id: canonicalId,
      name: issuerNames.get(canonicalId) ?? issuerNames.get(id) ?? id,
    }
  }

  return canonicalIssuer
}
