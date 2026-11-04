import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

import { useFormatFundQualityTitle } from './useFormatFundQualityTitle'

function Title({
  status,
  fallback,
}: {
  status: FundHoldingStatus | null | undefined
  fallback?: string
}) {
  const formatFundQualityTitle = useFormatFundQualityTitle()
  return formatFundQualityTitle(status, { fallback })
}

describe('useFormatFundQualityTitle', () => {
  it.each([
    { status: null, fallback: undefined, expected: '—' },
    { status: undefined, fallback: undefined, expected: '—' },
    { status: null, fallback: '', expected: '' },
    { status: undefined, fallback: 'Unavailable', expected: 'Unavailable' },
  ])(
    'formats missing status with $fallback',
    ({ status, fallback, expected }) => {
      expect(
        renderToStaticMarkup(<Title status={status} fallback={fallback} />),
      ).toBe(expected)
    },
  )

  it('keeps source fallbacks and diagnostic details with a formatted date', () => {
    expect(
      renderToStaticMarkup(
        <Title
          status={makeFundHoldingStatus({
            sourceName: '',
            issues: 'Missing weights',
          })}
        />,
      ),
    ).toBe(
      'Reliable: Source officielle · No source · 90.0 % explained · Composition dated 30 Sept 2026 · Missing weights',
    )
  })
})
