// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { op } from '@/domains/portfolio/shared/mocks/rawOperation.mock'
import { pos } from '@/domains/portfolio/shared/mocks/rawPosition.mock'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { ConcentrationPage } from './ConcentrationPage.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})
describe('ConcentrationPage source ownership', () => {
  it('renders its business surface from shared caches without a parent model', () => {
    const { client, wrapper: Wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        rawPositions: [pos({})],
        rawOperations: [op({})],
      }),
    )
    const html = renderToStaticMarkup(
      <Wrapper>
        <Suspense fallback={null}>
          <ConcentrationPage />
        </Suspense>
      </Wrapper>,
    )
    expect(html).toContain('Asset concentration')
    client.clear()
  })
  it('waits for its required source instead of presenting missing data as a loaded result', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    )
    const { client, wrapper: Wrapper } = createDashboardTestContext(false)
    const { unmount } = render(
      <Wrapper>
        <Suspense fallback={<p>Waiting for sources</p>}>
          <ConcentrationPage />
        </Suspense>
      </Wrapper>,
    )
    expect(screen.getByText('Waiting for sources')).toBeTruthy()
    unmount()
    client.clear()
  })
})
