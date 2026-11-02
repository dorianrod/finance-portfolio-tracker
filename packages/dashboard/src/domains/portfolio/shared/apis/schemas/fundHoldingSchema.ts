import { mixed, type Schema } from 'yup'

import { RAW_FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingSchema'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export const FUND_HOLDING_SCHEMA: Schema<FundHolding> = mixed<FundHolding>()
  .transform((_value: unknown, original: unknown): FundHolding => {
    const row = RAW_FUND_HOLDING_SCHEMA.validateSync(original, {
      stripUnknown: true,
    })
    return {
      parentIsin: row.parent_isin,
      parentTicker: row.parent_ticker,
      parentName: row.parent_name,
      holdingId: row.holding_id,
      holdingName: row.holding_name,
      issuerId: row.issuer_id || row.holding_id,
      issuerName: row.issuer_name || row.holding_name,
      weight: row.weight,
      sourceTier: row.source_tier,
      sourceName: row.source_name,
      holdingsDate: row.holdings_date,
      holdingKind: row.holding_kind,
      lookthroughPath: row.lookthrough_path,
      depth: row.depth,
      snapshotId: row.snapshot_id,
      sourceOrigin: row.source_origin,
      sourceUrl: row.source_url,
    }
  })
  .defined()
