import { describe, expect, it } from 'vitest'

import { pipelineError } from '@/domains/portfolio/features/data-quality/shared/mocks/pipelineError.mock'

import { countPipelineIssues } from './countPipelineIssues'

describe('countPipelineIssues', () => {
  it.each([
    {
      name: 'no issues',
      errors: [],
      expected: { errorCount: 0, warningCount: 0 },
    },
    {
      name: 'errors only',
      errors: [pipelineError({ level: 'error' })],
      expected: { errorCount: 1, warningCount: 0 },
    },
    {
      name: 'warnings only',
      errors: [pipelineError({ level: 'warning' })],
      expected: { errorCount: 0, warningCount: 1 },
    },
    {
      name: 'mixed severities',
      errors: [
        pipelineError({ level: 'error' }),
        pipelineError({ level: 'warning' }),
        pipelineError({ level: 'error' }),
      ],
      expected: { errorCount: 2, warningCount: 1 },
    },
  ])('counts $name without changing the source', ({ errors, expected }) => {
    expect(countPipelineIssues(Object.freeze(errors))).toEqual(expected)
  })
})
