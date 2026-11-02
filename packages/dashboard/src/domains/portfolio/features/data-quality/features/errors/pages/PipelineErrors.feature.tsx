import { ErrorsTab } from '@/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab/ErrorsTabController.feature'
import { useGetQualitySourcesQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetQualitySourcesQuery'
import { useQualityIssueScope } from '@/domains/portfolio/features/data-quality/shared/services/useQualityIssueScope'
export function PipelineErrors() {
  useGetQualitySourcesQuery()
  const { scopedPipelineErrors } = useQualityIssueScope()
  return <ErrorsTab errors={scopedPipelineErrors} />
}
