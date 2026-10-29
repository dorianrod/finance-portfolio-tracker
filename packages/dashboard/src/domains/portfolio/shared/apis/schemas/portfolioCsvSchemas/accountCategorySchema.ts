import * as yup from 'yup'

import {
  type AccountCategory,
  ALL_ACCOUNT_CATEGORIES,
} from '@/domains/portfolio/shared/types/accountCategory.type'

export const ACCOUNT_CATEGORY_SCHEMA = yup
  .string<AccountCategory>()
  .transform((value: unknown) =>
    typeof value === 'string' ? value.trim().toLowerCase() || null : value,
  )
  .oneOf(ALL_ACCOUNT_CATEGORIES)
  .nullable()
  .default(null)
  .defined()
