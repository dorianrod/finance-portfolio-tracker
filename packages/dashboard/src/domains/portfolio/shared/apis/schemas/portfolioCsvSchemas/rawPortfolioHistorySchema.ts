// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { RawPortfolioHistory } from '@/domains/portfolio/shared/types/rawPortfolioHistory.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { nullableNumber } from './nullableNumber'
import { requiredNumber } from './requiredNumber'

export const RAW_PORTFOLIO_HISTORY_SCHEMA: yup.ObjectSchema<RawPortfolioHistory> =
  yup.object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    total_value: requiredNumber(),
    total_cost_basis: requiredNumber(),
    unrealized_gain: requiredNumber(),
    net_cash_injected: requiredNumber(),
    cash_delta: nullableNumber(),
    tri: nullableNumber(),
    tri_rolling_1y: nullableNumber(),
    tri_rolling_3y: nullableNumber(),
  })
