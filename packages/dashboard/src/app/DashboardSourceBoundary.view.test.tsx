// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DashboardSourceBoundary } from './DashboardSourceBoundary.view'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('DashboardSourceBoundary', () => {
  it('renders a successful source subtree', () => {
    render(
      <DashboardSourceBoundary>
        <span>Source ready</span>
      </DashboardSourceBoundary>,
    )
    expect(screen.getByText('Source ready')).toBeDefined()
  })
  it('contains a source failure while preserving sibling shell content', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function FailedSource(): never {
      throw new Error('Source unavailable')
    }
    render(
      <>
        <span>Persistent shell</span>
        <DashboardSourceBoundary>
          <FailedSource />
        </DashboardSourceBoundary>
      </>,
    )
    expect(screen.getByText('Persistent shell')).toBeDefined()
    expect(screen.queryByText('Source unavailable')).toBeNull()
  })
})
