import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'

export function pipelineError(
  overrides: Partial<PipelineError>,
): PipelineError {
  return {
    source: 'main',
    level: 'warning',
    type: 'missing_price',
    date: null,
    account: '',
    isin: '',
    ticker: '',
    name: '',
    message: 'Issue',
    ...overrides,
  }
}
