// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { ApiHistoryPoint } from '@/domains/portfolio/shared/types/apiHistoryPoint.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const API_HISTORY_POINT_SCHEMA: yup.ObjectSchema<ApiHistoryPoint> =
  yup.object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    total_value: FINITE_NUMBER_SCHEMA.defined(),
    total_cost_basis: FINITE_NUMBER_SCHEMA.defined(),
    unrealized_gain: FINITE_NUMBER_SCHEMA.defined(),
    net_cash_injected: FINITE_NUMBER_SCHEMA.defined(),
    cash_delta: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
    tri: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
    tri_rolling_1y: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
    tri_rolling_3y: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
  })
