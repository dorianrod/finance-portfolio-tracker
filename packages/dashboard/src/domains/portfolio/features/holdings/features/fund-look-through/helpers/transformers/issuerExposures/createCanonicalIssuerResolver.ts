import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

/*
 * @architecture-decision canonical-issuer-prefix-index
 * @rules helpers-vercel-indexed-lookups
 * @choice Index the longest normalized issuer for every prefix of at least twelve UTF-16 code units.
 * @reason An ancestor cannot beat the queried ID itself; longest descendants reproduce strong-prefix matching, retaining input order on ties and authoritative market IDs.
 * @alternative Pairwise prefix comparisons preserve semantics but perform quadratic work for each new aggregate.
 * @revisit Canonicalization gains non-prefix matching or a different ambiguity policy.
 */
export function createCanonicalIssuerResolver(holdings: FundHolding[]) {
  // Some official files truncate long issuer names while others spell them
  // out. Merge only strong normalized-prefix matches; market identifiers
  // (ISIN-like values) remain authoritative and are never fuzzily merged.
  const issuerNames = new Map<string, string>()
  for (const holding of holdings)
    issuerNames.set(holding.issuerId, holding.issuerName)
  const normalizedIssuerIds = [...issuerNames.keys()].filter(
    (id) => !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(id),
  )
  const longestByPrefix = new Map<string, string>()
  for (const id of normalizedIssuerIds) {
    for (let length = 12; length <= id.length; length += 1) {
      const prefix = id.slice(0, length)
      const longest = longestByPrefix.get(prefix)
      if (longest == null || id.length > longest.length)
        longestByPrefix.set(prefix, id)
    }
  }
  const canonicalIssuerById = new Map(
    normalizedIssuerIds.map((id) => [id, longestByPrefix.get(id) ?? id]),
  )
  const canonicalIssuer = (id: string): { id: string; name: string } => {
    const canonicalId = canonicalIssuerById.get(id) ?? id
    return {
      id: canonicalId,
      name: issuerNames.get(canonicalId) ?? issuerNames.get(id) ?? id,
    }
  }

  return canonicalIssuer
}
