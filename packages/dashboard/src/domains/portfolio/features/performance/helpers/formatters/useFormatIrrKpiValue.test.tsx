// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatIrrKpiValue } from './useFormatIrrKpiValue'

afterEach(cleanup)

describe('useFormatIrrKpiValue', () => {
  it('uses the translation instance supplied by its React provider', async () => {
    const translation = createInstance()
    await translation.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: {
          translation: {
            'ui.formatirrkpivalueTs.calculating': 'Provider calculation',
          },
        },
      },
    })
    function Wrapper({ children }: { children: ReactNode }) {
      return <I18nextProvider i18n={translation}>{children}</I18nextProvider>
    }
    const { result } = renderHook(useFormatIrrKpiValue, { wrapper: Wrapper })

    expect(result.current(null, 'loading')).toBe('Provider calculation')
  })

  it.each([null, undefined])('uses the configured fallback for %s', (value) => {
    const { result } = renderHook(useFormatIrrKpiValue)
    expect(result.current(value, 'ready', { fallback: '' })).toBe('')
  })

  it('preserves the normal display', () => {
    const { result } = renderHook(useFormatIrrKpiValue)
    expect(result.current(0, 'ready')).toBe('+0.00%')
  })
})
