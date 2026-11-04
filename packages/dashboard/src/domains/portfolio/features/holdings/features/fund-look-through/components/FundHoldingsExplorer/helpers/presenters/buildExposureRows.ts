import type {
  ExposureSource,
  IssuerExposure,
  SecurityExposure,
} from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function buildExposureRows(
  displayed: IssuerExposure[],
  expanded: Set<string>,
): ExposureRow[] {
  return displayed.flatMap((issuer) => [
    { kind: 'issuer' as const, issuer, open: expanded.has(issuer.id) },
    ...(expanded.has(issuer.id)
      ? issuer.securities.flatMap((security): ExposureRow[] => [
          { kind: 'security', issuer, security },
          ...(security.sources.length > 1
            ? security.sources.map((source) => ({
                kind: 'source' as const,
                issuer,
                security,
                source,
              }))
            : []),
        ])
      : []),
  ])
}

export type ExposureRow =
  | { kind: 'issuer'; issuer: IssuerExposure; open: boolean }
  | { kind: 'security'; issuer: IssuerExposure; security: SecurityExposure }
  | {
      kind: 'source'
      issuer: IssuerExposure
      security: SecurityExposure
      source: ExposureSource
    }
