// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { afterEach, expect, it } from 'vitest'

import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityFundDiagnosticsOpenAtom'

import { AffectedAssetsPanel } from './AffectedAssetsPanel.feature'

afterEach(cleanup)

it('leaves the independently opened fund diagnostics intact when the assets panel unmounts', () => {
  const store = createStore()
  store.set(dataQualityFundDiagnosticsOpenAtom, true)
  const { unmount } = render(
    <Provider store={store}>
      <AffectedAssetsPanel assets={[]} />
    </Provider>,
  )
  unmount()
  expect(store.get(dataQualityFundDiagnosticsOpenAtom)).toBe(true)
})
