import * as yup from 'yup'

import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'

import { API_HISTORY_POINT_SCHEMA } from './apiHistoryPointSchema'

export const FILTERED_HISTORY_RESPONSE_SCHEMA: yup.ObjectSchema<PortfolioHistoryResponse> =
  yup.object({
    accounts: yup
      .array(yup.string().defined())
      .transform((value: unknown) => value ?? [])
      .default([])
      .defined(),
    history: yup
      .array(API_HISTORY_POINT_SCHEMA)
      .transform((value: unknown) => value ?? [])
      .default([])
      .defined(),
  })
