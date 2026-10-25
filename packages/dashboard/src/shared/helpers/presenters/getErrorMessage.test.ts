import { describe, expect, it } from 'vitest'
import { ValidationError } from 'yup'

import { HttpError } from '@/shared/http/httpError'

import { getErrorMessage } from './getErrorMessage'

describe('getErrorMessage', () => {
  it.each([
    [
      new Error('ui.errors.invalidData'),
      'The portfolio data is invalid. Run the pipeline and reload the dashboard.',
    ],
    [
      new HttpError(500, 'ui.errors.invalidData'),
      'The portfolio data is invalid. Run the pipeline and reload the dashboard.',
    ],
    [new Error('Calculation failed'), 'Calculation failed'],
    [new HttpError(500, 'Calculation failed'), 'Calculation failed'],
  ])(
    'translates known error keys and preserves readable messages: %s',
    (error, expected) => {
      expect(getErrorMessage(error)).toBe(expected)
    },
  )

  it('normalizes schema errors without exposing their internal paths', () => {
    expect(
      getErrorMessage(new ValidationError('assets[0].value is invalid')),
    ).toBe(getErrorMessage(new Error('ui.errors.invalidData')))
  })

  it('preserves HTTP-specific fallback messages', () => {
    expect(getErrorMessage(new HttpError(503))).toContain('503')
    expect(getErrorMessage(null)).toBe(
      getErrorMessage(new Error('ui.errors.unexpected')),
    )
  })
})
