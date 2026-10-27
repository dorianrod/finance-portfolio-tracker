import * as yup from 'yup'

import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import { requiredNumber } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/requiredNumber'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/csvBoolean.schema'

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
  coverage_gate_pass: CSV_BOOLEAN_SCHEMA,
  top_funds_gate_pass: CSV_BOOLEAN_SCHEMA,
  exact_proxy_gate_pass: CSV_BOOLEAN_SCHEMA,
  repeatability_gate_pass: CSV_BOOLEAN_SCHEMA,
  feasibility_status: yup
    .string<FundCoverageReport['feasibilityStatus']>()
    .oneOf(['passed', 'pending_repeatability', 'limited'])
    .defined(),
  fund_count: requiredNumber(),
  issue_count: requiredNumber(),
})
