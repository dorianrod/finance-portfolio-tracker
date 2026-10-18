import { describe, expect, it } from 'vitest'
import {
  analyseIncomePlacement,
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
} from './annualIncomeSavings.logic'

function point(overrides: Partial<AnnualIncomeSavingsPoint>): AnnualIncomeSavingsPoint {
  return {
    year: 2024,
    incomeStatus: 'actual',
    netSalary: 50000,
    otherIncome: 10000,
    totalIncome: 60000,
    grossSalary: 75000,
    placedSavings: 30000,
    savingsThrough: '2024-12-31',
    savingsStatus: 'complete',
    placementRate: 50,
    unplacedIncomeProxy: 30000,
    comparable: true,
    ...overrides,
  }
}

describe('mapAnnualIncomeSavings', () => {
  it('maps nullable values, statuses and booleans', () => {
    const result = mapAnnualIncomeSavings([{
      year: '2026',
      income_status: 'forecast',
      net_salary: '60000',
      other_income: '12000',
      total_income: '72000',
      gross_salary: '90000',
      placed_savings: '10000',
      savings_through: '2026-10-17',
      savings_status: 'partial',
      placement_rate: '',
      unplaced_income_proxy: '',
      comparable: 'False',
    }])

    expect(result).toEqual([point({
      year: 2026,
      incomeStatus: 'forecast',
      netSalary: 60000,
      otherIncome: 12000,
      totalIncome: 72000,
      grossSalary: 90000,
      placedSavings: 10000,
      savingsThrough: '2026-10-17',
      savingsStatus: 'partial',
      placementRate: null,
      unplacedIncomeProxy: null,
      comparable: false,
    })])
  })
})

describe('analyseIncomePlacement', () => {
  it('excludes forecast and non-comparable years from the relationship', () => {
    const result = analyseIncomePlacement([
      point({ year: 2023, totalIncome: 50000, placementRate: 40 }),
      point({ year: 2024, totalIncome: 60000, placementRate: 50 }),
      point({ year: 2025, comparable: false, placementRate: null }),
      point({ year: 2026, incomeStatus: 'forecast', comparable: true, placementRate: 60 }),
    ])

    expect(result.points.map(({ year }) => year)).toEqual([2023, 2024])
    expect(result.correlation).toBeCloseTo(1)
    expect(result.slopePerTenThousand).toBeCloseTo(10)
    expect(result.trendLine).toEqual([
      { totalIncome: 50000, placementRate: 40 },
      { totalIncome: 60000, placementRate: 50 },
    ])
  })

  it('returns no statistic with insufficient or constant data', () => {
    expect(analyseIncomePlacement([point({})])).toMatchObject({
      correlation: null,
      slopePerTenThousand: null,
      trendLine: [],
    })
    expect(analyseIncomePlacement([
      point({ year: 2023, totalIncome: 60000, placementRate: 40 }),
      point({ year: 2024, totalIncome: 60000, placementRate: 50 }),
    ])).toMatchObject({
      correlation: null,
      slopePerTenThousand: null,
      trendLine: [],
    })
  })

  it('computes a negative relationship when placement rate falls with income', () => {
    const result = analyseIncomePlacement([
      point({ year: 2022, totalIncome: 40000, placementRate: 60 }),
      point({ year: 2023, totalIncome: 50000, placementRate: 50 }),
      point({ year: 2024, totalIncome: 60000, placementRate: 40 }),
    ])

    expect(result.correlation).toBeCloseTo(-1)
    expect(result.slopePerTenThousand).toBeCloseTo(-10)
  })
})
