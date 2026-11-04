// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ValidationError } from 'yup'

import { HttpError } from '@/shared/http/httpError'

import { useFormatErrorMessage } from './useFormatErrorMessage'

afterEach(cleanup)

function formatErrorMessage(error: unknown) {
  const { result } = renderHook(useFormatErrorMessage)
  return result.current(error)
}

describe('formatErrorMessage', () => {
  it.each([null, undefined])(
    'supports an empty display fallback for %s',
    (error) => {
      const { result } = renderHook(useFormatErrorMessage)
      expect(result.current(error, { fallback: '' })).toBe('')
    },
  )

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
    [new Error('constructor'), 'constructor'],
    [new HttpError(500, 'Calculation failed'), 'Calculation failed'],
  ])(
    'translates known error keys and preserves readable messages: %s',
    (error, expected) => {
      expect(formatErrorMessage(error)).toBe(expected)
    },
  )

  it('normalizes schema errors without exposing their internal paths', () => {
    expect(
      formatErrorMessage(new ValidationError('assets[0].value is invalid')),
    ).toBe(formatErrorMessage(new Error('ui.errors.invalidData')))
  })

  it.each([
    'Failed to fetch',
    'fetch failed',
    'NetworkError when attempting to fetch resource.',
    'Load failed',
  ])('translates the browser network failure %s', (message) => {
    expect(formatErrorMessage(new TypeError(message))).toBe(
      'Unable to reach the server. Check your connection and try again.',
    )
  })

  it('preserves unrelated TypeErrors and translates timeout errors', () => {
    expect(formatErrorMessage(new TypeError('Invalid calculation'))).toBe(
      'Invalid calculation',
    )
    expect(
      formatErrorMessage(new DOMException('Request expired', 'TimeoutError')),
    ).toBe('The request timed out. Try again.')
  })

  it('normalizes malformed JSON and CSV without exposing parser internals', () => {
    expect(formatErrorMessage(new SyntaxError('Unexpected token <'))).toBe(
      formatErrorMessage(new ValidationError('Invalid response')),
    )
  })

  it('preserves HTTP-specific fallback messages', () => {
    expect(formatErrorMessage(new HttpError(503))).toContain('503')
    expect(formatErrorMessage(null)).toBe(
      formatErrorMessage(new Error('ui.errors.unexpected')),
    )
  })
})
