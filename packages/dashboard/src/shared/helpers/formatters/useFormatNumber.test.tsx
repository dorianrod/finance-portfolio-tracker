import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatNumber } from './useFormatNumber'

function NumberFallbackProbe({
  value,
  options,
}: {
  value: number | null | undefined
  options?: Parameters<ReturnType<typeof useFormatNumber>>[1]
}) {
  const formatNumber = useFormatNumber()
  return formatNumber(value, options)
}

function NumberProbe() {
  const formatNumber = useFormatNumber()
  return (
    <>
      {[
        formatNumber(1_234),
        formatNumber(12.345, { maximumFractionDigits: 2 }),
        formatNumber(1.2, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          signDisplay: 'always',
        }),
      ].join('|')}
    </>
  )
}

describe('useFormatNumber', () => {
  it.each([
    { value: null, expected: '—' },
    { value: undefined, expected: '—' },
    { value: null, options: { fallback: '' }, expected: '' },
    { value: 0, expected: '0' },
    { value: 0, options: { zeroAsFallback: true }, expected: '—' },
    {
      value: -0,
      options: { fallback: '', zeroAsFallback: true },
      expected: '',
    },
    { value: -2, options: { zeroAsFallback: true }, expected: '-2' },
    { value: Number.NaN, expected: '0' },
    { value: Infinity, expected: '0' },
    {
      value: null,
      options: {
        fallback: 0,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always',
      },
      expected: '+0.00',
    },
    {
      value: 1.2,
      options: {
        fallback: '',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always',
      },
      expected: '+1.20',
    },
  ] as const)(
    'formats $value with fallback options $options',
    ({ value, options, expected }) => {
      expect(
        renderToStaticMarkup(
          <NumberFallbackProbe value={value} options={options} />,
        ),
      ).toBe(expected)
    },
  )

  it('formats grouped, precise and signed numbers', () => {
    expect(renderToStaticMarkup(<NumberProbe />)).toBe('1,234|12.35|+1.20')
  })
})
