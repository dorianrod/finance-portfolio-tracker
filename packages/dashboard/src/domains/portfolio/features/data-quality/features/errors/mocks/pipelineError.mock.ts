import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'

export function makePipelineError(
  overrides: Partial<PipelineError> = {},
): PipelineError {
  return {
    source: 'main',
    level: 'error',
    type: 'missing_price',
    date: new Date('2026-01-31'),
    account: 'broker',
    isin: 'FR0000000001',
    ticker: 'ALPHA',
    name: 'Alpha',
    message: 'missing_price',
    ...overrides,
  }
}
