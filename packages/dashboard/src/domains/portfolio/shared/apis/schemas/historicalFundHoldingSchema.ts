import { mixed, object, type Schema } from 'yup'

import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import { readCsvValue } from '@/shared/csv/csvData/readCsvValue'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { FUND_HOLDING_SCHEMA } from './fundHoldingSchema'
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
      const row = readCsvValue(RAW_FUND_HOLDING_HISTORY_SCHEMA, original)
      return {
        ...readCsvValue(FUND_HOLDING_SCHEMA, original),
        effectiveDate: row.effective_date,
        historySnapshotId: row.history_snapshot_id,
        capturedAt: row.captured_at,
      }
    })
    .defined()

// Validate the history metadata separately so base holding fields are validated only once.
const RAW_FUND_HOLDING_HISTORY_SCHEMA = object({
  effective_date: CALENDAR_DATE_SCHEMA.required(),
  history_snapshot_id: requiredText().required(),
  captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
