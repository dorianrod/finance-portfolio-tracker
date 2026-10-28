import { describe, expect, it } from 'vitest'

import { scopePipelineErrors } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/selectors/scopePipelineErrors'
import { pipelineError } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/pipelineError.mock'
import { baseFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('scopePipelineErrors', () => {
  it('keeps only anomalies in the selected account and period', () => {
    const errors = [
      pipelineError({
        message: 'selected',
        account: 'acc1',
        date: new Date('2026-05'),
      }),
      pipelineError({
        message: 'other account',
        account: 'acc2',
        date: new Date('2026-05'),
      }),
      pipelineError({
        message: 'other period',
        account: 'acc1',
        date: new Date('2025-12'),
      }),
    ]

    const result = scopePipelineErrors(
      errors,
      [position({ account: 'acc1' })],
      baseFilters({
        accounts: new Set(['acc1']),
        dateFrom: new Date('2026-01-15'),
      }),
    )

    expect(result.map((error) => error.message)).toEqual(['selected'])
  })

  it('matches asset anomalies without an account and retains global anomalies', () => {
    const errors = [
      pipelineError({ message: 'selected asset', isin: 'FR1' }),
      pipelineError({ message: 'other asset', isin: 'FR2' }),
      pipelineError({ message: 'global parsing issue', type: 'parsing_error' }),
    ]

    const result = scopePipelineErrors(
      errors,
      [position({ account: 'acc1', isin: 'FR1' })],
      baseFilters({ accountTypes: new Set(['PEA']) }),
    )

    expect(result.map((error) => error.message)).toEqual([
      'selected asset',
      'global parsing issue',
    ])
  })

  it('does not hide anomalies when no position filter is active', () => {
    const errors = [
      pipelineError({ account: 'acc1' }),
      pipelineError({ account: 'acc2' }),
    ]

    expect(
      scopePipelineErrors(
        errors,
        [position({ account: 'acc1' })],
        baseFilters(),
      ),
    ).toEqual(errors)
  })
})
