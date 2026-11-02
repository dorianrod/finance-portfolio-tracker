import { queryOptions } from '@tanstack/react-query'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'

import type { FundHoldingsWorkerMessage } from './portfolioFundHoldings.worker'
import { requestPortfolioFundHoldings } from './requestPortfolioFundHoldings'

export const PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('fund-holdings'),
  queryFn: ({ signal }): Promise<FundHoldingsData> => {
    if (typeof Worker === 'undefined') return requestPortfolioFundHoldings()
    return loadInWorker(signal)
  },
})

/*
 * @architecture-decision fund-source-background-validation
 * @rules api-use-transformation, ui-vercel-responsive-rendering
 * @choice Fetch, parse and validate fund sources in a short-lived worker, then cache their typed result in React Query.
 * @reason The real composition history has over 145,000 rows; its synchronous Yup transforms block the main thread for several seconds.
 * @alternative Promise-based validation still runs those transforms on the UI thread; deferring React renders cannot interrupt them.
 * @revisit Fund sources become small enough for bounded main-thread validation or are served as a different validated transport.
 */
function loadInWorker(signal: AbortSignal): Promise<FundHoldingsData> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./portfolioFundHoldings.worker.ts', import.meta.url),
      { type: 'module' },
    )
    const cleanup = () => {
      signal.removeEventListener('abort', abort)
      worker.terminate()
    }
    const abort = () => {
      cleanup()
      reject(new DOMException('Fund holdings request aborted', 'AbortError'))
    }
    worker.onmessage = ({ data }: MessageEvent<FundHoldingsWorkerMessage>) => {
      cleanup()
      if (data instanceof Error) reject(data)
      else resolve(data)
    }
    worker.onerror = (event) => {
      cleanup()
      reject(new Error(event.message))
    }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
    else worker.postMessage(null)
  })
}
