import * as yup from 'yup'

import type {
  FundCoverageReport,
  FundHoldingStatus,
  FundQualityTier,
  FundValidationStatus,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import {
  CALENDAR_DATE_SCHEMA,
  OPTIONAL_CALENDAR_DATE_SCHEMA,
} from '@/shared/schemas/calendarDate.schema'
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

const requiredText = () => yup.string().trim().ensure().defined()
const optionalText = () => yup.string().trim().ensure().defined()
const requiredNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? 0 : value,
  ).defined()
const optionalNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? undefined : value,
  ).optional()
const requiredBoolean = () =>
  yup
    .boolean()
    .transform(
      (_value, originalValue) =>
        originalValue === true ||
        String(originalValue).trim().toLowerCase() === 'true',
    )
    .defined()
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

export const RAW_FUND_HOLDING_SCHEMA = yup.object({
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  holding_id: requiredText().required(),
  holding_name: requiredText(),
  issuer_id: optionalText(),
  issuer_name: optionalText(),
  weight: requiredNumber(),
  source_tier: yup
    .string<FundQualityTier | ''>()
    .oneOf(['A', 'B', 'C', 'D', ''])
    .optional(),
  source_name: optionalText(),
  holdings_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  holding_kind: optionalText(),
  lookthrough_path: optionalText(),
  depth: optionalNumber(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  source_url: optionalText(),
})

export const RAW_FUND_HOLDING_HISTORY_SCHEMA = RAW_FUND_HOLDING_SCHEMA.shape({
  effective_date: CALENDAR_DATE_SCHEMA.required(),
  history_snapshot_id: requiredText().required(),
  captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})

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

export const RAW_FUND_SNAPSHOT_SCHEMA = yup.object({
  fund_id: requiredText(),
  fund_name: requiredText(),
  snapshot_id: requiredText(),
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  as_of_date: CALENDAR_DATE_SCHEMA.required(),
  generated_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  origin: requiredText(),
  status: requiredText(),
  is_active: requiredBoolean(),
  is_stale: requiredBoolean(),
  age_days: requiredNumber(),
  holding_count: requiredNumber(),
  weight_sum: requiredNumber(),
  coverage_pct: requiredNumber(),
  complete: requiredBoolean(),
  source_urls: requiredText(),
  evidence_path: requiredText(),
  holdings_path: requiredText(),
  checksum_sha256: requiredText(),
  notes: requiredText(),
  validation_errors: requiredText(),
})

export const RAW_FUND_UNRESOLVED_SCHEMA = yup.object({
  parent_id: requiredText(),
  parent_name: requiredText(),
  unresolved_id: requiredText(),
  unresolved_name: requiredText(),
  reason: requiredText(),
  path: requiredText(),
  weight: requiredNumber(),
  market_value: requiredNumber(),
  queued_for_research: requiredBoolean(),
  detected_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})

export const RAW_FUND_COVERAGE_REPORT_SCHEMA = yup.object({
  as_of_date: CALENDAR_DATE_SCHEMA.required(),
  portfolio_value: requiredNumber(),
  fund_value: requiredNumber(),
  direct_identified_value: requiredNumber(),
  opaque_value: requiredNumber(),
  decomposed_value: requiredNumber(),
  high_confidence_explained_value: requiredNumber(),
  undisclosed_fund_value: requiredNumber(),
  fund_coverage_pct: requiredNumber(),
  portfolio_coverage_pct: requiredNumber(),
  coverage_gate_pass: requiredBoolean(),
  top_funds_gate_pass: requiredBoolean(),
  exact_proxy_gate_pass: requiredBoolean(),
  repeatability_gate_pass: requiredBoolean(),
  feasibility_status: yup
    .string<FundCoverageReport['feasibilityStatus']>()
    .oneOf(['passed', 'pending_repeatability', 'limited'])
    .defined(),
  fund_count: requiredNumber(),
  issue_count: requiredNumber(),
})
