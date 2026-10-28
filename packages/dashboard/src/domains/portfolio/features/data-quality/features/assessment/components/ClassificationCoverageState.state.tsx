import { AllocationCoverageCard } from '@/domains/portfolio/features/data-quality/features/assessment/components/AllocationCoverageCard.feature'
import type { ClassificationViewState } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildClassificationViewState'
import i18n from '@/i18n/i18n'

import { EmptyClassificationState } from './EmptyClassificationState.view'

export function ClassificationCoverageState({
  state,
}: ClassificationCoverageStateProps) {
  switch (state.status) {
    case 'loading':
      return (
        <EmptyClassificationState
          message={i18n.t('ui.dataqualitytab.loadingClassificationCoverage')}
        />
      )
    case 'empty':
      return (
        <EmptyClassificationState
          message={i18n.t(
            'ui.dataqualitytab.noClassificationCoverageDataAvailable',
          )}
        />
      )
    case 'not-applicable':
      return (
        <EmptyClassificationState
          message={i18n.t(
            'ui.dataqualitytab.classificationIsNotApplicableToSavingsCheckingAndBrokerage',
          )}
        />
      )
    case 'ready':
      return (
        <AllocationCoverageCard
          coverage={state.coverage}
          dimensionCoverage={state.dimensionCoverage}
        />
      )
  }

  const exhaustiveState: never = state
  return exhaustiveState
}

type ClassificationCoverageStateProps = {
  state: ClassificationViewState
}
