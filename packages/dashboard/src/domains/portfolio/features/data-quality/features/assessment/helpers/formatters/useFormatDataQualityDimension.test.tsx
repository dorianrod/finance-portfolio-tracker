// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
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

  it.each<[DataQualityDimension, string]>([
    ['geo', 'Geography'],
    ['secteur', 'Sector'],
    ['currency', 'Currency'],
    ['classe', 'Asset class'],
  ])('preserves the title label for %s', (dimension, expected) => {
    const { result } = renderHook(useFormatDataQualityDimension)
    expect(result.current(dimension, { style: 'title' })).toBe(expected)
  })

  it.each([null, undefined])(
    'supports the caller fallback for %s',
    (dimension) => {
      const { result } = renderHook(useFormatDataQualityDimension)
      expect(result.current(dimension)).toBe('—')
      expect(result.current(dimension, { fallback: '' })).toBe('')
      expect(
        result.current(dimension, { style: 'title', fallback: 'Unknown' }),
      ).toBe('Unknown')
    },
  )

  it('reads each display style from its provider', async () => {
    const translations = createInstance()
    await translations.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: {
          translation: {
            'ui.allocationdimensionquality.geography': 'Local geography',
            'ui.builddataqualityviewmodel.geography': 'local geography',
          },
        },
      },
    })
    const { result } = renderHook(useFormatDataQualityDimension, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nextProvider i18n={translations}>{children}</I18nextProvider>
      ),
    })
    expect(result.current('geo')).toBe('local geography')
    expect(result.current('geo', { style: 'title' })).toBe('Local geography')
  })
})
