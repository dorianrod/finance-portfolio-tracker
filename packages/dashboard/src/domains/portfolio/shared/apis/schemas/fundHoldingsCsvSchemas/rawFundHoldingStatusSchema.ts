// eslint-disable-next-line local/review-shared-feature-sharing -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type {
  FundHoldingStatus,
  FundQualityTier,
  FundValidationStatus,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { optionalText } from './optionalText'
import { requiredBoolean } from './requiredBoolean'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

const optionalBoolean = () =>
  yup
    .boolean()
    .transform((_value, originalValue) =>
      originalValue === '' || originalValue == null
        ? undefined
        : originalValue === true ||
          String(originalValue).trim().toLowerCase() === 'true',
    )
    .optional()

export const RAW_FUND_HOLDING_STATUS_SCHEMA = yup.object({
  parent_id: requiredText(),
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  quality_tier: yup
    .string<FundQualityTier | ''>()
    .oneOf(['A', 'B', 'C', 'D', ''])
    .defined(),
  validation_status: yup
    .string<FundValidationStatus | ''>()
    .oneOf(['ok', 'warning', 'error', ''])
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
  is_stale: requiredBoolean(),
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
    .string<FundHoldingStatus['decompositionState'] | ''>()
    .oneOf(['resolved', 'partial', 'unresolved', 'stale', ''])
    .optional(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  manual_attention: optionalBoolean(),
  checksum_sha256: optionalText(),
})
