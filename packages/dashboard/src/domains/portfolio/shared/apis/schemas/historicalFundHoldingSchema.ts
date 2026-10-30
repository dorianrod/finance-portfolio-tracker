// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-30; Historical compositions feed holdings previews, overview comparisons and concentration history through the shell; the sharing detector cannot follow those props.
import { mixed, type Schema } from 'yup'

import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { FUND_HOLDING_SCHEMA } from './fundHoldingSchema'
import { RAW_FUND_HOLDING_SCHEMA } from './fundHoldingsCsvSchemas/rawFundHoldingSchema'
import { requiredText } from './fundHoldingsCsvSchemas/requiredText'
/*
 * @architecture-decision shared-historical-fund-response
 * @rules arch-shared-no-domain-knowledge, helpers-categories
 * @choice Keep historical fund wire adaptation private to this common response schema.
 * @reason Holdings, overview and diversification consume the same validated composition history through the shell.
 * @alternative A holdings-private schema would hide the common source owner; a second wire-only module fragments one response boundary.
 * @revisit Historical fund responses gain a separate capability-specific lifecycle.
 */
export const HISTORICAL_FUND_HOLDING_SCHEMA: Schema<HistoricalFundHolding> =
  mixed<HistoricalFundHolding>()
    .transform((_value: unknown, original: unknown): HistoricalFundHolding => {
      const row = RAW_FUND_HOLDING_HISTORY_SCHEMA.validateSync(original, {
        stripUnknown: true,
      })
      return {
        ...FUND_HOLDING_SCHEMA.validateSync(row),
        effectiveDate: row.effective_date,
        historySnapshotId: row.history_snapshot_id,
        capturedAt: row.captured_at,
      }
    })
    .defined()

const RAW_FUND_HOLDING_HISTORY_SCHEMA = RAW_FUND_HOLDING_SCHEMA.shape({
  effective_date: CALENDAR_DATE_SCHEMA.required(),
  history_snapshot_id: requiredText().required(),
  captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
