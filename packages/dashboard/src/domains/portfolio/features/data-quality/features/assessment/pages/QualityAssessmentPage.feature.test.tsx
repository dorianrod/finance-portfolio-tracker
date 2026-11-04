// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { QualityAssessmentPage } from './QualityAssessmentPage.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})
describe('QualityAssessmentPage source ownership', () => {
  it('renders its business surface from shared caches without a parent model', () => {
    const { client, wrapper: Wrapper } = createDashboardTestContext()

    const html = renderToStaticMarkup(
      <Wrapper>
        <Suspense fallback={null}>
          <QualityAssessmentPage>
            <span />
          </QualityAssessmentPage>
        </Suspense>
      </Wrapper>,
    )
    expect(html).toContain('Data quality themes')
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
          <QualityAssessmentPage>
            <span />
          </QualityAssessmentPage>
        </Suspense>
      </Wrapper>,
    )
    expect(screen.getByText('Waiting for sources')).toBeTruthy()
    unmount()
    client.clear()
  })
})
