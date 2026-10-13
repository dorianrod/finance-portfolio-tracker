import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'

export interface SecurityExposure {
  id: string
  name: string
  value: number
  funds: string[]
}

export interface IssuerExposure {
  id: string
  name: string
  value: number
  weight: number
  securities: SecurityExposure[]
  funds: string[]
}

export function isFundPosition(position: PositionRow): boolean {
  return /\b(?:ETF|UCITS|FUND)\b/i.test(position.name)
    || /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers)\b/i.test(position.name)
}

export function holdingsForPosition(
  position: PositionRow,
  holdings: FundHolding[],
): FundHolding[] {
  return holdings.filter((holding) => (
    (!!position.isin && holding.parentIsin === position.isin)
    || (!!position.ticker && holding.parentTicker === position.ticker)
  ))
}

export function statusForPosition(
  position: PositionRow,
  statuses: FundHoldingStatus[],
): FundHoldingStatus | undefined {
  return statuses.find((status) => (
    (!!position.isin && status.parentIsin === position.isin)
    || (!!position.ticker && status.parentTicker === position.ticker)
    || status.parentId === (position.isin || position.ticker)
  ))
}

export function buildIssuerExposures(
  positions: PositionRow[],
  holdings: FundHolding[],
): IssuerExposure[] {
  const byParent = new Map<string, FundHolding[]>()
  for (const holding of holdings) {
    for (const key of [holding.parentIsin, holding.parentTicker].filter(Boolean)) {
      const rows = byParent.get(key) ?? []
      rows.push(holding)
      byParent.set(key, rows)
    }
  }

  // Some official files truncate long issuer names while others spell them
  // out. Merge only strong normalized-prefix matches; market identifiers
  // (ISIN-like values) remain authoritative and are never fuzzily merged.
  const issuerNames = new Map<string, string>()
  for (const holding of holdings) issuerNames.set(holding.issuerId, holding.issuerName)
  const normalizedIssuerIds = [...issuerNames.keys()].filter((id) => !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(id))
  const canonicalIssuerById = new Map<string, string>()
  for (const id of normalizedIssuerIds) {
    const matches = normalizedIssuerIds.filter((candidate) => (
      Math.min(candidate.length, id.length) >= 12
      && (candidate.startsWith(id) || id.startsWith(candidate))
    ))
    canonicalIssuerById.set(id, matches.sort((a, b) => b.length - a.length)[0] ?? id)
  }
  const canonicalIssuer = (id: string): { id: string; name: string } => {
    const canonicalId = canonicalIssuerById.get(id) ?? id
    return { id: canonicalId, name: issuerNames.get(canonicalId) ?? issuerNames.get(id) ?? id }
  }

  interface MutableSecurity { id: string; name: string; value: number; funds: Set<string> }
  interface MutableIssuer { id: string; name: string; value: number; securities: Map<string, MutableSecurity>; funds: Set<string> }
  const issuers = new Map<string, MutableIssuer>()
  const total = positions.reduce((sum, position) => (
    position.status === 'active' ? sum + Math.max(0, position.total_value ?? 0) : sum
  ), 0)

  const add = (
    issuerId: string,
    issuerName: string,
    securityId: string,
    securityName: string,
    value: number,
    fundName: string,
  ) => {
    const issuer = issuers.get(issuerId) ?? {
      id: issuerId, name: issuerName, value: 0,
      securities: new Map<string, MutableSecurity>(), funds: new Set<string>(),
    }
    issuer.value += value
    if (fundName) issuer.funds.add(fundName)
    const security = issuer.securities.get(securityId) ?? {
      id: securityId, name: securityName, value: 0, funds: new Set<string>(),
    }
    security.value += value
    if (fundName) security.funds.add(fundName)
    issuer.securities.set(securityId, security)
    issuers.set(issuerId, issuer)
  }

  for (const position of positions) {
    const positionValue = position.status === 'active' ? Math.max(0, position.total_value ?? 0) : 0
    if (positionValue <= 0) continue
    const fundRows = byParent.get(position.isin) ?? byParent.get(position.ticker)
    if (fundRows?.length) {
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
    if (directId && !isFundPosition(position)) {
      add(directId, position.name, directId, position.name, positionValue, '')
    }
  }

  return [...issuers.values()]
    .map((issuer) => ({
      id: issuer.id,
      name: issuer.name,
      value: issuer.value,
      weight: total > 0 ? issuer.value / total * 100 : 0,
      funds: [...issuer.funds].sort(),
      securities: [...issuer.securities.values()]
        .map((security) => ({ ...security, funds: [...security.funds].sort() }))
        .sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value)
}
