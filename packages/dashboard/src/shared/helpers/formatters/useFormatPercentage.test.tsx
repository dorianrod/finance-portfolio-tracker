import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatPercentage } from './useFormatPercentage'

function PercentageFallbackProbe({
  value,
  options,
}: {
  value: number | null | undefined
  options?: Parameters<ReturnType<typeof useFormatPercentage>>[1]
}) {
  const formatPercentage = useFormatPercentage()
  return formatPercentage(value, options)
}

function PercentageProbe() {
  const formatPercentage = useFormatPercentage()
  return (
    <>
      {[
        formatPercentage(12.36),
        formatPercentage(12.3, { decimals: 2, signed: true }),
        formatPercentage(-5.7, { signed: true, unit: ' pp' }),
        formatPercentage(Number.NaN),
      ].join('|')}
    </>
  )
}

describe('useFormatPercentage', () => {
  it.each([
    { value: null, expected: '—' },
    { value: undefined, expected: '—' },
    { value: null, options: { fallback: '' }, expected: '' },
    { value: 0, expected: '0.0%' },
    { value: 0, options: { decimals: 'auto' }, expected: '0%' },
    { value: 2.5, options: { decimals: 'auto' }, expected: '2.5%' },
    { value: 0.125, options: { decimals: 'auto' }, expected: '0.125%' },
    { value: 0, options: { zeroAsFallback: true }, expected: '—' },
    {
      value: -0,
      options: { fallback: '', zeroAsFallback: true },
      expected: '',
    },
    { value: -2, options: { zeroAsFallback: true }, expected: '-2.0%' },
    { value: Infinity, expected: '0.0%' },
    { value: null, options: { suffix: '/yr' }, expected: '—' },
    {
      value: 0,
      options: { suffix: '/yr', zeroAsFallback: true },
      expected: '—',
    },
    {
      value: 6,
      options: { decimals: 2, signed: true, suffix: '/yr' },
      expected: '+6.00%/yr',
    },
    {
      value: null,
      options: { fallback: 0, decimals: 2, signed: true, unit: ' pp' },
      expected: '+0.00 pp',
    },
  ] as const)(
    'formats $value with fallback options $options',
    ({ value, options, expected }) => {
      expect(
        renderToStaticMarkup(
          <PercentageFallbackProbe value={value} options={options} />,
        ),
      ).toBe(expected)
    },
  )

  it('normalizes precision, signs and units', () => {
    expect(renderToStaticMarkup(<PercentageProbe />)).toBe(
      '12.4%|+12.30%|-5.7 pp|0.0%',
    )
  })
})
