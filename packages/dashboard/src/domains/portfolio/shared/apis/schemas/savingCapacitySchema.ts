import { mixed, type Schema } from 'yup'

import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import { RAW_SAVING_CAPACITY_SCHEMA } from './portfolioCsvSchemas/rawSavingCapacitySchema'
export const SAVING_CAPACITY_SCHEMA: Schema<SavingCapacityPoint> =
  mixed<SavingCapacityPoint>()
    .transform((_value: unknown, original: unknown): SavingCapacityPoint => {
      const row = RAW_SAVING_CAPACITY_SCHEMA.validateSync(original, {
        stripUnknown: true,
      })
      return {
        date: row.snapshot_date,
        savings_delta: row.savings_delta,
        perf_delta: row.perf_delta,
      }
    })
    .defined()
