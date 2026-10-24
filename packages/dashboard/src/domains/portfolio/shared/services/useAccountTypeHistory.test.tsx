import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useAccountTypeHistory } from './useAccountTypeHistory'

function Probe() {
  const history = useAccountTypeHistory(new Set())
  return <output data-points={history.data.length} data-types={history.accountTypes.length} />
}

describe('useAccountTypeHistory', () => {
  it('returns an empty aggregation before positions resolve', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}><Probe /></QueryClientProvider>,
    )
    expect(html).toContain('data-points="0"')
    expect(html).toContain('data-types="0"')
  })
})
