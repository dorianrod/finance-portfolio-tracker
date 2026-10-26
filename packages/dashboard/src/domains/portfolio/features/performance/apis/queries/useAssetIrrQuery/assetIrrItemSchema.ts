import * as yup from 'yup'

import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const ASSET_IRR_ITEM_SCHEMA: yup.ObjectSchema<AssetIrrItem> = yup.object(
  {
    key: yup.string().defined(),
    label: yup.string().ensure().defined(),
    name: yup.string().ensure().defined(),
    irr: FINITE_NUMBER_SCHEMA.defined(),
    value: FINITE_NUMBER_SCHEMA.defined(),
    accounts: yup
      .array(yup.string().defined())
      .transform((value) => value ?? [])
      .default([])
      .defined(),
    account_types: yup
      .array(yup.string().defined())
      .transform((value) => value ?? [])
      .default([])
      .defined(),
  },
)
