// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { exposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/exposureSource.mock'
import '@/i18n/i18n'

import { useFormatExposureSourceLabel } from './useFormatExposureSourceLabel'

afterEach(cleanup)

describe('exposure source labels', () => {
  it.each([
    { source: exposureSource(), options: {}, expected: 'Example fund' },
    { source: exposureSource({ fund: null }), options: {}, expected: 'Direct' },
    { source: exposureSource({ fund: 'Direct' }), options: {}, expected: 'Direct' },
    { source: null, options: {}, expected: '—' },
    { source: undefined, options: { fallback: 'Unavailable' }, expected: 'Unavailable' },
    { source: null, options: { fallback: '' }, expected: '' },
  ])('formats $source as $expected', ({ source, options, expected }) => {
    const { result } = renderHook(useFormatExposureSourceLabel)
    expect(result.current(source, options)).toBe(expected)
  })
})
