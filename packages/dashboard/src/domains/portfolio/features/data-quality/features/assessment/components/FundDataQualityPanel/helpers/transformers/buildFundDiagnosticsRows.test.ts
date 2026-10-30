import { describe, expect, it } from 'vitest'

import { makeFundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundSnapshot.mock'
import { makeFundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundUnresolved.mock'
import { makeFundHolding } from '@/domains/portfolio/shared/mocks/fundHolding.mock'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'

import {
  buildFundDiagnosticsRows,
  type FundDiagnosticsFilter,
} from './buildFundDiagnosticsRows'

describe('buildFundDiagnosticsRows', () => {
  it('attaches only matching evidence and ranks the unexplained monetary impact', () => {
    const statuses = [
      makeFundHoldingStatus({ parentId: 'first', residualValue: 10 }),
      makeFundHoldingStatus({ parentId: 'second', residualValue: 20 }),
      makeFundHoldingStatus({ parentId: 'missing', residualValue: 0 }),
    ]
    const holdings = [makeFundHolding({ parentIsin: 'first' })]
    const snapshots = [makeFundSnapshot({ fundId: 'second' })]
    const unresolved = [makeFundUnresolved({ parentId: 'first' })]
    const rows = buildFundDiagnosticsRows({
      filter: 'all',
      statuses,
      holdings,
      snapshots,
      unresolved,
    })

    expect(rows.map((row) => row.status.parentId)).toEqual([
      'second',
      'first',
      'missing',
    ])
    expect(rows[0]).toMatchObject({ holdings: [], snapshots, unresolved: [] })
    expect(rows[1]).toMatchObject({ holdings, snapshots: [], unresolved })
    expect(rows[2]).toMatchObject({
      holdings: [],
      snapshots: [],
      unresolved: [],
    })
    expect(statuses.map((status) => status.parentId)).toEqual([
      'first',
      'second',
      'missing',
    ])
  })

  it.each<[FundDiagnosticsFilter, number]>([
    ['all', 1],
    ['issues', 0],
    ['reliable', 1],
    ['partial', 0],
    ['unavailable', 0],
  ])(
    'applies the %s filter without requiring related exports',
    (filter, expected) => {
      const rows = buildFundDiagnosticsRows({
        filter,
        statuses: [
          makeFundHoldingStatus({
            qualityTier: 'A',
            validationStatus: 'ok',
            residualPct: 0,
          }),
        ],
        holdings: [],
        snapshots: [],
        unresolved: [],
      })
      expect(rows).toHaveLength(expected)
    },
  )

  it('accepts an empty diagnostic source', () => {
    expect(
      buildFundDiagnosticsRows({
        filter: 'all',
        statuses: [],
        holdings: [],
        snapshots: [],
        unresolved: [],
      }),
    ).toEqual([])
  })
})
