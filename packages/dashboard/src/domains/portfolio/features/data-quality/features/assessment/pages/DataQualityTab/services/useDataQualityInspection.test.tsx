// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { dataQualityClassificationDetailsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/stores/dataQualityPanels/dataQualityClassificationDetailsOpen.atoms'
import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/stores/dataQualityPanels/dataQualityFundDiagnosticsOpen.atoms'

import { useDataQualityInspection } from './useDataQualityInspection'

afterEach(cleanup)

type InspectionInput = Parameters<typeof useDataQualityInspection>[0]

function setup(overrides: Partial<InspectionInput> = {}) {
  const store = createStore()
  const input: InspectionInput = {
    activeThemeId: 'lookthrough',
    affectedAssetCount: 2,
    classificationApplicableValue: 100,
    fundIssueCount: 3,
    fundStatusCount: 1,
    hasLookThroughScope: true,
    ...overrides,
  }
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
  return {
    store,
    ...renderHook(useDataQualityInspection, {
      initialProps: input,
      wrapper: Wrapper,
    }),
  }
}

describe('data quality inspection', () => {
  it.each([
    ['lookthrough', dataQualityFundDiagnosticsOpenAtom, '3 issues to inspect'],
    [
      'classification',
      dataQualityClassificationDetailsOpenAtom,
      '2 assets to inspect',
    ],
  ] as const)(
    'opens the %s detail panel and closes it on unmount',
    (activeThemeId, targetAtom, detail) => {
      const { result, store, unmount } = setup({ activeThemeId })
      expect(result.current?.label).toBe('Inspect')
      expect(result.current?.detail).toBe(detail)
      expect(result.current?.expanded).toBe(false)
      act(() => {
        result.current?.onClick()
      })
      expect(store.get(targetAtom)).toBe(true)
      expect(result.current?.expanded).toBe(true)
      unmount()
      expect(store.get(targetAtom)).toBe(false)
    },
  )

  it.each<Partial<InspectionInput>>([
    { activeThemeId: 'pipeline' },
    { activeThemeId: 'prices' },
    { hasLookThroughScope: false },
    { fundStatusCount: 0 },
    { activeThemeId: 'classification', classificationApplicableValue: 0 },
  ])('has no inspection action for unavailable details: %o', (input) => {
    const { result } = setup(input)
    expect(result.current).toBeNull()
  })

  it('updates the classification count and availability with the selected scope', () => {
    const { result, rerender } = setup({ activeThemeId: 'classification' })
    const input: InspectionInput = {
      activeThemeId: 'classification',
      affectedAssetCount: 0,
      classificationApplicableValue: 100,
      fundIssueCount: 0,
      fundStatusCount: 0,
      hasLookThroughScope: false,
    }
    rerender(input)
    expect(result.current?.detail).toBe('No affected asset')
    rerender({ ...input, classificationApplicableValue: 0 })
    expect(result.current).toBeNull()
  })
})
