// eslint-disable-next-line local/review-shared-feature-sharing -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import type { InferType } from 'yup'

import type { RAW_FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingSchema'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export function mapFundHolding(
  row: InferType<typeof RAW_FUND_HOLDING_SCHEMA>,
): FundHolding {
  return {
    parentIsin: row.parent_isin,
    parentTicker: row.parent_ticker,
    parentName: row.parent_name,
    holdingId: row.holding_id,
    holdingName: row.holding_name,
    issuerId: row.issuer_id || row.holding_id,
    issuerName: row.issuer_name || row.holding_name,
    weight: row.weight,
    sourceTier: row.source_tier ?? '',
    sourceName: row.source_name,
    holdingsDate: row.holdings_date,
    holdingKind: row.holding_kind || 'security',
    lookthroughPath: row.lookthrough_path,
    depth: row.depth,
    snapshotId: row.snapshot_id,
    sourceOrigin: row.source_origin || 'deterministic',
    sourceUrl: row.source_url,
  }
}
