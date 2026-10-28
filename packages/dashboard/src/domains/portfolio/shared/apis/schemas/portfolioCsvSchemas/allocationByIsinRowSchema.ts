// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this allocation source to diversification charts and quality assessment coverage. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

const ALLOCATION_METADATA_COLUMNS = new Set([
  'snapshot_date',
  'account',
  'account_type',
  'isin',
  'name',
])

const ALLOCATION_VALUES_SCHEMA = yup
  .mixed<Record<string, number>>()
  .defined()
  .test(
    'allocation-values',
    'Allocation values must be finite numbers',
    (values) =>
      typeof values === 'object' &&
      values !== null &&
      !Array.isArray(values) &&
      Object.values(values).every(
        (value) => typeof value === 'number' && Number.isFinite(value),
      ),
  )

export const ALLOCATION_BY_ISIN_ROW_SCHEMA: yup.ObjectSchema<RawIsinRow> = yup
  .object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    account: yup.string().optional(),
    account_type: yup.string().optional(),
    isin: yup.string().defined(),
    name: yup.string().defined(),
    values: ALLOCATION_VALUES_SCHEMA,
  })
  .transform((row: unknown) => {
    if (!isRecord(row)) return row
    const source = row
    const values = Object.fromEntries(
      Object.entries(source)
        .filter(([key]) => !ALLOCATION_METADATA_COLUMNS.has(key))
        .map(([key, value]) => [key, Number(value)] as const)
        .filter(([, value]) => !Number.isFinite(value) || value > 0),
    )
    const hasAccount = Boolean(source['account'])
    const hasAccountType = Boolean(source['account_type'])
    return {
      snapshot_date: source['snapshot_date'],
      account: hasAccount ? source['account'] : undefined,
      account_type: hasAccountType ? source['account_type'] : undefined,
      isin: source['isin'],
      name: source['name'],
      values,
    }
  })

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
