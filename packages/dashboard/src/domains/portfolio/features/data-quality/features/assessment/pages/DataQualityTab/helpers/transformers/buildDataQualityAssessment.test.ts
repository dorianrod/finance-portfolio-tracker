import { describe, expect, it } from 'vitest'

import { position } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/coveragePosition.mock'
import { createDataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/dataQualityTabProps.mock'
import { makeFundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundCoverageReport.mock'
import { status } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/qualityFundStatus.mock'
import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import { isinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'

import { buildDataQualityAssessment } from './buildDataQualityAssessment'

describe('buildDataQualityAssessment', () => {
  it('groups affected dimensions per asset, ranks the largest gaps and preserves inputs', () => {
    const input = createDataQualityTabProps({
      positions: [
        position({ id: 'fund', isin: 'FUND', total_value: 1000 }),
        position({
          id: 'missing',
          isin: 'MISSING',
          name: 'Missing allocation',
          total_value: 500,
        }),
      ],
      rawData: rawData({
        geo: [isinRow({ isin: 'FUND', values: { France: 800, nc: 200 } })],
        secteur: [
          isinRow({ isin: 'FUND', values: { Technology: 600, nc: 400 } }),
        ],
        currency: [isinRow({ isin: 'FUND', values: { EUR: 1000 } })],
        classe: [isinRow({ isin: 'FUND', values: { Equities: 1000 } })],
      }),
    })
    const before = structuredClone(input)

    const result = buildDataQualityAssessment(input)

    expect(result.affectedAssets).toEqual([
      {
        id: 'MISSING',
        name: 'Missing allocation',
        value: 500,
        dimensions: ['geo', 'secteur', 'currency', 'classe'],
        largestGapValue: 500,
        largestGapPct: 100,
      },
      {
        id: 'FUND',
        name: 'Asset X',
        value: 1000,
        dimensions: ['geo', 'secteur'],
        largestGapValue: 400,
        largestGapPct: 40,
      },
    ])
    expect(result.classificationApplicableValue).toBe(1500)
    expect(result.classificationGap).toBe(33.3)
    expect(result.classificationViewState.status).toBe('ready')
    expect(input).toEqual(before)
  })

  it.each([
    { loading: false, expected: 'empty' },
    { loading: true, expected: 'loading' },
  ])(
    'resolves $expected coverage without manufacturing affected assets',
    ({ loading, expected }) => {
      const result = buildDataQualityAssessment(
        createDataQualityTabProps({ rawData: rawData({ loading }) }),
      )

      expect(result.classificationViewState).toEqual({ status: expected })
      expect(result.affectedAssets).toEqual([])
      expect(result.classificationApplicableValue).toBe(0)
      expect(result.fundIssueCount).toBe(0)
    },
  )

  it('keeps savings outside classification instead of reporting a missing allocation', () => {
    const result = buildDataQualityAssessment(
      createDataQualityTabProps({
        positions: [
          position({ account_category: 'savings', total_value: 1000 }),
        ],
      }),
    )

    expect(result.classificationViewState).toEqual({ status: 'not-applicable' })
    expect(result.classificationIsNotApplicable).toBe(true)
    expect(result.classificationApplicableValue).toBe(0)
    expect(result.affectedAssets).toEqual([])
  })

  it('counts validation failures and unresolved fund exposure in the selected scope', () => {
    const result = buildDataQualityAssessment(
      createDataQualityTabProps({
        positions: [position({ isin: 'FUND', total_value: 1000 })],
        fundStatuses: [
          status({
            validationStatus: 'error',
            residualPct: 20,
            explainedPct: 80,
          }),
        ],
        fundReport: makeFundCoverageReport(),
      }),
    )

    expect(result.fundErrorCount).toBe(1)
    expect(result.fundIssueCount).toBe(1)
    expect(result.hasLookThroughScope).toBe(true)
    expect(result.unresolvedPct).toBe(20)
    expect(result.scopedFundData.statuses).toHaveLength(1)
  })
})
