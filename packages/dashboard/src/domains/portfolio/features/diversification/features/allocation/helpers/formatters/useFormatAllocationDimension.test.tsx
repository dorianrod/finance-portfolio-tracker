// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

import { useFormatAllocationDimension } from './useFormatAllocationDimension'

afterEach(cleanup)

describe('allocation dimension labels', () => {
  it.each<[AllocationDimension, string]>([
    ['geo', 'Geo'],
    ['secteur', 'Sector'],
    ['currency', 'Currency'],
    ['classe', 'Class'],
  ])('preserves the short label for %s', (dimension, expected) => {
    const { result } = renderHook(useFormatAllocationDimension)
    expect(result.current(dimension)).toBe(expected)
  })

  it.each([null, undefined])('owns fallbacks for %s', (dimension) => {
    const { result } = renderHook(useFormatAllocationDimension)
    expect(result.current(dimension)).toBe('—')
    expect(result.current(dimension, { fallback: '' })).toBe('')
    expect(result.current(dimension, { fallback: 'Unknown dimension' })).toBe(
      'Unknown dimension',
    )
  })

  it('reads translations from its provider', async () => {
    const translations = createInstance()
    await translations.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: { translation: { 'ui.filterchipbar.geo': 'Local geography' } },
      },
    })
    const { result } = renderHook(useFormatAllocationDimension, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nextProvider i18n={translations}>{children}</I18nextProvider>
      ),
    })
    expect(result.current('geo')).toBe('Local geography')
  })
})
