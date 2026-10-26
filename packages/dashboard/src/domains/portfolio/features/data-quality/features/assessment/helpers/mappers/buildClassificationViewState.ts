import type {
  AccountCoverage,
  DimensionCoverage,
} from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverage.types'

export function buildClassificationViewState({
  loading,
  classificationIsNotApplicable,
  coverage,
  dimensionCoverage,
}: BuildClassificationViewStateInput): ClassificationViewState {
  if (loading) return { status: 'loading' }
  if (classificationIsNotApplicable) return { status: 'not-applicable' }
  if (coverage.length > 0)
    return { status: 'ready', coverage, dimensionCoverage }
  return { status: 'empty' }
}

export type ClassificationViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'not-applicable' }
  | {
      status: 'ready'
      coverage: AccountCoverage[]
      dimensionCoverage: DimensionCoverage[]
    }

type BuildClassificationViewStateInput = {
  loading: boolean
  classificationIsNotApplicable: boolean
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
}
