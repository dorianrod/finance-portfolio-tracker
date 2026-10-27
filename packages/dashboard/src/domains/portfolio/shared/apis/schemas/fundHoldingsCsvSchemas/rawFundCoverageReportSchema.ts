// eslint-disable-next-line local/review-shared-feature-sharing -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { requiredBoolean } from './requiredBoolean'
import { requiredNumber } from './requiredNumber'

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
