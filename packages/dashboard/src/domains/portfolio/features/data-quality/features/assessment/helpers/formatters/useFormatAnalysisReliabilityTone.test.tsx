// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'

import { useFormatAnalysisReliabilityTone } from './useFormatAnalysisReliabilityTone'

afterEach(cleanup)

describe('analysis reliability labels', () => {
  it.each<[AnalysisReliabilityTone, string]>([
    ['healthy', 'Reliable'],
    ['warning', 'Partial'],
    ['critical', 'Review'],
    ['unavailable', 'Unavailable'],
  ])('preserves the status label for %s', (tone, expected) => {
    const { result } = renderHook(useFormatAnalysisReliabilityTone)
    expect(result.current(tone)).toBe(expected)
  })

  it.each([null, undefined])('owns fallbacks for %s', (tone) => {
    const { result } = renderHook(useFormatAnalysisReliabilityTone)
    expect(result.current(tone)).toBe('—')
    expect(result.current(tone, { fallback: '' })).toBe('')
    expect(result.current(tone, { fallback: 'Unknown reliability' })).toBe(
      'Unknown reliability',
    )
  })

  it('reads translations from its provider', async () => {
    const translations = createInstance()
    await translations.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: {
          translation: { 'ui.analysisreliabilitykpi.reliable': 'Local status' },
        },
      },
    })
    const { result } = renderHook(useFormatAnalysisReliabilityTone, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nextProvider i18n={translations}>{children}</I18nextProvider>
      ),
    })
    expect(result.current('healthy')).toBe('Local status')
  })
})
