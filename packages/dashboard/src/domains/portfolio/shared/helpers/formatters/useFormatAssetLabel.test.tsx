import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useFormatAssetLabel } from './useFormatAssetLabel'

function AssetLabelProbe() {
  const formatAssetLabel = useFormatAssetLabel()
  return <>{[
    formatAssetLabel({ name: 'Global Equity', ticker: 'GE' }),
    formatAssetLabel({ name: ' ', ticker: 'GE' }),
    formatAssetLabel({}, 'Unknown asset'),
  ].join('|')}</>
}

describe('useFormatAssetLabel', () => {
  it('uses the asset name, ticker and fallback in that order', () => {
    expect(renderToStaticMarkup(<AssetLabelProbe />)).toBe('Global Equity|GE|Unknown asset')
  })
})
