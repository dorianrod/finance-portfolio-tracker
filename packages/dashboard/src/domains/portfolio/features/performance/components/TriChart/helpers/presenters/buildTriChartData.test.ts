import { describe, expect, it } from 'vitest'

import { buildTriChartData } from '@/domains/portfolio/features/performance/components/TriChart/helpers/presenters/buildTriChartData'
import { historyPoint } from '@/domains/portfolio/features/performance/mocks/historyPoint.mock'

describe('buildTriChartData', () => {
  it('starts at the first history point and backfills each missing rolling span with its first value', () => {
    const result = buildTriChartData([
      historyPoint(new Date('2021-01-01'), null, null),
      historyPoint(new Date('2022-01-01'), 8, null),
      historyPoint(new Date('2023-01-01'), 10, null),
      historyPoint(new Date('2024-01-01'), 12, 7),
      historyPoint(new Date('2025-01-01'), 9, 6),
    ])

    expect(result.map((point) => point.date)).toEqual([
      new Date('2021-01-01'),
      new Date('2022-01-01'),
      new Date('2023-01-01'),
      new Date('2024-01-01'),
      new Date('2025-01-01'),
    ])
    expect(result.map((point) => point.tri_rolling_1y_backfill)).toEqual([
      8,
      8,
      null,
      null,
      null,
    ])
    expect(result.map((point) => point.tri_rolling_3y_backfill)).toEqual([
      7,
      7,
      7,
      7,
      null,
    ])
    expect(result.map((point) => point.tri_rolling_3y)).toEqual([
      null,
      null,
      null,
      7,
      6,
    ])
  })

  it('returns no chart data when no rolling IRR exists', () => {
    expect(
      buildTriChartData([historyPoint(new Date('2021-01-01'), null, null)]),
    ).toEqual([])
  })
})
