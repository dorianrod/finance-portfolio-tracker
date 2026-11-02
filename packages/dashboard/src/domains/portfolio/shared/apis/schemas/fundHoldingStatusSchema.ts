import { mixed, type Schema } from 'yup'

import { RAW_FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingStatusSchema'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

export const FUND_HOLDING_STATUS_SCHEMA: Schema<FundHoldingStatus> =
  mixed<FundHoldingStatus>()
    .transform((_value: unknown, original: unknown): FundHoldingStatus => {
      const row = RAW_FUND_HOLDING_STATUS_SCHEMA.validateSync(original, {
        stripUnknown: true,
      })
      return {
        parentId: row.parent_id || row.parent_isin || row.parent_ticker,
        parentIsin: row.parent_isin,
        parentTicker: row.parent_ticker,
        parentName: row.parent_name,
        qualityTier: row.quality_tier,
        validationStatus: row.validation_status,
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
        decompositionState: row.decomposition_state,
        snapshotId: row.snapshot_id,
        sourceOrigin: row.source_origin,
        manualAttention: row.manual_attention,
        checksumSha256: row.checksum_sha256,
      }
    })
    .defined()
