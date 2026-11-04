// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { makePipelineError } from '@/domains/portfolio/features/data-quality/features/errors/mocks/pipelineError.mock'

import { ErrorsTab } from './ErrorsTabController.feature'

afterEach(cleanup)

describe('ErrorsTab', () => {
  it('filters by severity and restores both rows when filters are reset', async () => {
    const user = userEvent.setup()
    render(
      <ErrorsTab
        errors={[
          makePipelineError(),
          makePipelineError({
            level: 'warning',
            name: 'Beta',
            isin: 'FR0000000002',
            type: 'parsing_error',
          }),
        ]}
      />,
    )
    expect(screen.getByRole('row', { name: /Alpha/ })).toBeTruthy()
    expect(screen.getByRole('row', { name: /Beta/ })).toBeTruthy()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter anomalies by level' }),
      'warning',
    )
    expect(screen.queryByRole('row', { name: /Alpha/ })).toBeNull()
    expect(screen.getByRole('row', { name: /Beta/ })).toBeTruthy()
    expect(screen.getByText('1 error')).toBeTruthy()
    expect(screen.getByText('1 warning')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('row', { name: /Alpha/ })).toBeTruthy()
    expect(screen.getByRole('row', { name: /Beta/ })).toBeTruthy()
  })

  it('toggles the same column between ascending and descending order', async () => {
    const user = userEvent.setup()
    render(
      <ErrorsTab
        errors={[
          makePipelineError(),
          makePipelineError({ name: 'Beta', isin: 'FR0000000002' }),
        ]}
      />,
    )
    const sort = screen.getByRole('button', { name: /Asset/ })
    await user.click(sort)
    expect(
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[4].textContent),
    ).toEqual(['Alpha', 'Beta'])
    await user.click(sort)
    expect(
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[4].textContent),
    ).toEqual(['Beta', 'Alpha'])
    expect(screen.getByText('2 errors')).toBeTruthy()
  })

  it('renders the empty state without unavailable filter controls', () => {
    render(<ErrorsTab errors={[]} />)
    expect(screen.getByText('No pipeline anomalies detected')).toBeTruthy()
    expect(screen.queryByRole('combobox')).toBeNull()
  })
  it('renders and sorts unknown diagnostic types and sources with prototype-like names', async () => {
    const user = userEvent.setup()
    render(
      <ErrorsTab
        errors={[
          makePipelineError({ type: 'constructor', source: 'constructor' }),
          makePipelineError({
            type: '__proto__',
            source: '__proto__',
            name: 'Beta',
          }),
        ]}
      />,
    )
    expect(screen.getByRole('option', { name: 'constructor' })).toBeDefined()
    expect(screen.getByRole('option', { name: '__proto__' })).toBeDefined()
    await user.click(screen.getByRole('button', { name: /Type/ }))
    expect(screen.getByRole('row', { name: /Alpha/ }).textContent).toContain(
      'constructor',
    )
    expect(screen.getByRole('row', { name: /Beta/ }).textContent).toContain(
      '__proto__',
    )
  })
})
