import type {
  AccountCoverage,
  DimensionCoverage,
} from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'

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

export function buildClassificationViewState({
  loading,
  classificationIsNotApplicable,
  coverage,
  dimensionCoverage,
}: BuildClassificationViewStateInput): ClassificationViewState {
  if (loading) return { status: 'loading' }
  if (classificationIsNotApplicable) return { status: 'not-applicable' }
  if (coverage.length > 0) return { status: 'ready', coverage, dimensionCoverage }
  return { status: 'empty' }
}
