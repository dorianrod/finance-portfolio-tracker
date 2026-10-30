import { describe, expect, it } from 'vitest'

import { makeAccountCoverage as fixtureAccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/accountCoverage.mock'
import { makeDimensionCoverage as fixtureDimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/dimensionCoverage.mock'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/dimensionCoverage.type'

import { buildClassificationViewState } from './buildClassificationViewState'

const coverage: AccountCoverage[] = [fixtureAccountCoverage()]

const dimensionCoverage: DimensionCoverage[] = [fixtureDimensionCoverage()]

describe('buildClassificationViewState', () => {
  it('prioritizes loading over every other state', () => {
    expect(
      buildClassificationViewState({
        loading: true,
        classificationIsNotApplicable: true,
        coverage,
        dimensionCoverage,
      }),
    ).toEqual({ status: 'loading' })
  })

  it('prioritizes not applicable over available coverage', () => {
    expect(
      buildClassificationViewState({
        loading: false,
        classificationIsNotApplicable: true,
        coverage,
        dimensionCoverage,
      }),
    ).toEqual({ status: 'not-applicable' })
  })

  it('returns ready with its required data when coverage is available', () => {
    expect(
      buildClassificationViewState({
        loading: false,
        classificationIsNotApplicable: false,
        coverage,
        dimensionCoverage,
      }),
    ).toEqual({ status: 'ready', coverage, dimensionCoverage })
  })

  it('returns empty when no higher-priority state or coverage applies', () => {
    expect(
      buildClassificationViewState({
        loading: false,
        classificationIsNotApplicable: false,
        coverage: [],
        dimensionCoverage: [],
      }),
    ).toEqual({ status: 'empty' })
  })
})
