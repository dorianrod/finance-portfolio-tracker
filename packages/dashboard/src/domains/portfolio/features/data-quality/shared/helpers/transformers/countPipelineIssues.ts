import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'

/*
 * @architecture-decision pipeline-severity-counts
 * @rules helpers-categories, arch-shared-no-domain-knowledge
 * @choice Count source severities through one data-quality shared transformer.
 * @reason Assessment, reliability and the error table need the same statistic independently of visible table filters.
 * @alternative Separate leaf counters duplicate severity policy; application-wide shared code would acquire data-quality knowledge.
 * @revisit Severity semantics or source-count scope differs between assessment and errors.
 */
export function countPipelineIssues(errors: readonly PipelineError[]) {
  let errorCount = 0
  let warningCount = 0
  for (const error of errors) {
    if (error.level === 'error') errorCount += 1
    else warningCount += 1
  }
  return { errorCount, warningCount }
}
