// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundValidationStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'
import { CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/csvBoolean.schema'
import { OPTIONAL_CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/optionalCsvBoolean.schema'

import { optionalText } from './optionalText'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_FUND_HOLDING_STATUS_SCHEMA = yup.object({
  parent_id: requiredText(),
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  quality_tier: yup
    .string<FundQualityTier>()
    .ensure()
    .transform((value: string) => value || 'D')
    .oneOf(['A', 'B', 'C', 'D'])
    .default('D')
    .defined(),
  validation_status: yup
    .string<FundValidationStatus>()
    .ensure()
    .transform((value: string) => value || 'error')
    .oneOf(['ok', 'warning', 'error'])
    .default('error')
    .defined(),
  source_name: requiredText(),
  source_type: requiredText(),
  source_url: requiredText(),
  index_name: requiredText(),
  replication_method: requiredText(),
  proxy_name: requiredText(),
  proxy_isin: requiredText(),
  fetched_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  holdings_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  freshness_days: requiredNumber(),
  is_stale: CSV_BOOLEAN_SCHEMA,
  holding_count: requiredNumber(),
  raw_weight_sum: requiredNumber(),
  explained_pct: requiredNumber(),
  residual_pct: requiredNumber(),
  market_value: requiredNumber(),
  explained_value: requiredNumber(),
  residual_value: requiredNumber(),
  refresh_streak: requiredNumber(),
  issues: requiredText(),
  decomposition_state: yup
    .string()
    .ensure()
    .transform((value: string) => value || 'unresolved')
    .default('unresolved')
    .defined(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  manual_attention: OPTIONAL_CSV_BOOLEAN_SCHEMA.default(false).defined(),
  checksum_sha256: optionalText(),
})
