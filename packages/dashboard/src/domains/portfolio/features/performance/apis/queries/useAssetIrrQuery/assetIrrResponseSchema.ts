import * as yup from 'yup'

import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { ASSET_IRR_ITEM_SCHEMA } from './assetIrrItemSchema'

export const ASSET_IRR_RESPONSE_SCHEMA: yup.ObjectSchema<AssetIrrSummary> =
  yup.object({
    available: yup.boolean().defined(),
    start_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
    end_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
    assets: yup
      .array(ASSET_IRR_ITEM_SCHEMA)
      .transform((value) => value ?? [])
      .default([])
      .defined(),
  })
