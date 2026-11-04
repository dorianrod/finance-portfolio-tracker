import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  type AssetLabelSource,
  useFormatAssetLabel,
} from './useFormatAssetLabel'

function AssetLabelProbe({
  source,
  fallback,
}: {
  source: AssetLabelSource | null | undefined
  fallback?: string
}) {
  const formatAssetLabel = useFormatAssetLabel()
  return formatAssetLabel(source, { fallback })
}

describe('useFormatAssetLabel', () => {
  it.each([
    {
      source: { name: 'Global Equity', ticker: 'GE' },
      expected: 'Global Equity',
    },
    { source: { name: ' ', ticker: 'GE' }, expected: 'GE' },
    { source: {}, expected: '' },
    { source: null, expected: '' },
    { source: undefined, expected: '' },
    { source: null, fallback: 'Unknown asset', expected: 'Unknown asset' },
    { source: undefined, fallback: 'Unknown asset', expected: 'Unknown asset' },
  ])(
    'formats $source with fallback $fallback',
    ({ source, fallback, expected }) => {
      expect(
        renderToStaticMarkup(
          <AssetLabelProbe source={source} fallback={fallback} />,
        ),
      ).toBe(expected)
    },
  )
})
