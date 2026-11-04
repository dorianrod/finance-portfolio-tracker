import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'

import { requestPortfolioFundHoldings } from './requestPortfolioFundHoldings'

export type FundHoldingsWorkerMessage = FundHoldingsData | Error

self.onmessage = () => {
  requestPortfolioFundHoldings()
    .then((data) => reply(data))
    .catch((error: unknown) => {
      reply(error instanceof Error ? error : new Error(String(error)))
    })
}

function reply(message: FundHoldingsWorkerMessage) {
  self.postMessage(message)
}
