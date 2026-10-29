// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityDimension.type'

import { useFormatDataQualityDimension } from './useFormatDataQualityDimension'

afterEach(cleanup)

describe('data quality dimension labels', () => {
  it.each<{ dimension: DataQualityDimension; expected: string }>([
    { dimension: 'geo', expected: 'geography' },
    { dimension: 'secteur', expected: 'sector' },
    { dimension: 'currency', expected: 'currency' },
    { dimension: 'classe', expected: 'asset class' },
  ])('formats $dimension', ({ dimension, expected }) => {
    const { result } = renderHook(useFormatDataQualityDimension)
    expect(result.current(dimension)).toBe(expected)
  })

  it.each([null, undefined])('supports the caller fallback for %s', (dimension) => {
    const { result } = renderHook(useFormatDataQualityDimension)
    expect(result.current(dimension, { fallback: '' })).toBe('')
  })
})
