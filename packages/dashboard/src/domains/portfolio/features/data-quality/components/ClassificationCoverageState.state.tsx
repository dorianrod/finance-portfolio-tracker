import i18n from '@/i18n/i18n'
import { AllocationCoverageCard } from '@/domains/portfolio/features/data-quality/components/AllocationCoverageCard.feature'
import type { ClassificationViewState } from '@/domains/portfolio/features/data-quality/helpers/mappers/buildClassificationViewState'

interface ClassificationCoverageStateProps {
  state: ClassificationViewState
}

export function ClassificationCoverageState({ state }: ClassificationCoverageStateProps) {
  switch (state.status) {
    case 'loading':
      return <EmptyClassificationState message={i18n.t('ui.dataqualitytab.loadingClassificationCoverage')} />
    case 'empty':
      return <EmptyClassificationState message={i18n.t('ui.dataqualitytab.noClassificationCoverageDataAvailable')} />
    case 'not-applicable':
      return <EmptyClassificationState message={i18n.t('ui.dataqualitytab.classificationIsNotApplicableToSavingsCheckingAndBrokerage')} />
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

function EmptyClassificationState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950/30 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}
