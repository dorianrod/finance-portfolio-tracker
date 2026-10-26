// eslint-disable-next-line local/shared-feature-usage -- Validated fund status inputs feed holdings previews and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import type { InferType } from 'yup'

import type { RAW_FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingStatusSchema'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'

export function mapFundHoldingStatus(
  row: InferType<typeof RAW_FUND_HOLDING_STATUS_SCHEMA>,
): FundHoldingStatus {
  return {
    parentId: row.parent_id || row.parent_isin || row.parent_ticker,
    parentIsin: row.parent_isin,
    parentTicker: row.parent_ticker,
    parentName: row.parent_name,
    qualityTier: row.quality_tier || 'D',
    validationStatus: row.validation_status || 'error',
    sourceName: row.source_name,
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    indexName: row.index_name,
    replicationMethod: row.replication_method,
    proxyName: row.proxy_name,
    proxyIsin: row.proxy_isin,
    fetchedAt: row.fetched_at,
    holdingsDate: row.holdings_date,
    freshnessDays: row.freshness_days,
    isStale: row.is_stale,
    holdingCount: row.holding_count,
    rawWeightSum: row.raw_weight_sum,
    explainedPct: row.explained_pct,
    residualPct: row.residual_pct,
    marketValue: row.market_value,
    explainedValue: row.explained_value,
    residualValue: row.residual_value,
    refreshStreak: row.refresh_streak,
    issues: row.issues,
    decompositionState: row.decomposition_state || 'unresolved',
    snapshotId: row.snapshot_id,
    sourceOrigin: row.source_origin,
    manualAttention: row.manual_attention ?? false,
    checksumSha256: row.checksum_sha256,
  }
}
