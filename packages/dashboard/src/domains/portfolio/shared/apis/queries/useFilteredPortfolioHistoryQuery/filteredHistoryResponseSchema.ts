// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'

import { API_HISTORY_POINT_SCHEMA } from './apiHistoryPointSchema'

export const FILTERED_HISTORY_RESPONSE_SCHEMA: yup.ObjectSchema<PortfolioHistoryResponse> =
  yup.object({
    accounts: yup
      .array(yup.string().defined())
      .transform((value) => value ?? [])
      .default([])
      .defined(),
    history: yup
      .array(API_HISTORY_POINT_SCHEMA)
      .transform((value) => value ?? [])
      .default([])
      .defined(),
  })
