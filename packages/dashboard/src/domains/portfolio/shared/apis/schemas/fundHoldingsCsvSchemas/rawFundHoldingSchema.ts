// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { optionalNumber } from './optionalNumber'
import { optionalText } from './optionalText'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

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
