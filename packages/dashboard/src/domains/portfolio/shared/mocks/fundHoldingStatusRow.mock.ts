import type { InferType } from 'yup'

import type { RAW_FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingStatusSchema'

export function fundHoldingStatusRow(): InferType<typeof RAW_FUND_HOLDING_STATUS_SCHEMA> {
  return {
    parent_id: 'FR0000000001',
    parent_isin: 'FR0000000001',
    parent_ticker: 'FUND',
    parent_name: 'Example fund',
    quality_tier: 'A',
    validation_status: 'ok',
    source_name: 'Official source',
    source_type: 'official',
    source_url: 'https://example.com/fund',
    index_name: '',
    replication_method: '',
    proxy_name: '',
    proxy_isin: '',
    fetched_at: new Date('2026-09-30T12:00:00Z'),
    holdings_date: new Date('2026-09-30T00:00:00Z'),
    freshness_days: 1,
    is_stale: false,
    holding_count: 10,
    raw_weight_sum: 1,
    explained_pct: 90,
    residual_pct: 10,
    market_value: 1_000,
    explained_value: 900,
    residual_value: 100,
    refresh_streak: 2,
    issues: '',
    decomposition_state: 'partial',
    snapshot_id: 'snapshot-1',
    source_origin: 'deterministic',
    manual_attention: false,
    checksum_sha256: '',
  }
}
