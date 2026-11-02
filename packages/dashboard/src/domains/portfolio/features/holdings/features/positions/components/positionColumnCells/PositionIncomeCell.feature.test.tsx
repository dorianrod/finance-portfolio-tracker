// @vitest-environment jsdom
import { createTable, getCoreRowModel } from '@tanstack/react-table'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { PositionIncomeCell } from './PositionIncomeCell.feature'

afterEach(cleanup)

describe('position passive income', () => {
  it('keeps dividend and interest taxes separate from their gross amounts', () => {
    const table = createTable<TableRow>({
      columns: [],
      data: [
        makePosition({
          total_dividends: 100,
          total_dividends_net: 70,
          total_interest: 50,
          total_interest_net: 35,
          tax_rate: 0.3,
        }),
      ],
      getCoreRowModel: getCoreRowModel(),
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
    })
    render(<PositionIncomeCell row={table.getRowModel().rows[0]} />)
    expect(screen.getByText('€100')).toBeTruthy()
    expect(screen.getByText('€50 int.')).toBeTruthy()
    expect(screen.getByText('~-€30 tax on div. (30%)')).toBeTruthy()
    expect(screen.getByText('~-€15 tax on int. (30%)')).toBeTruthy()
    expect(screen.queryByText('net (0% tax)')).toBeNull()
  })

  it('labels tax-free income without displaying tax estimates', () => {
    const table = createTable<TableRow>({
      columns: [],
      data: [
        makePosition({
          total_dividends: 100,
          total_dividends_net: 100,
          tax_rate: 0,
        }),
      ],
      getCoreRowModel: getCoreRowModel(),
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
    })
    render(<PositionIncomeCell row={table.getRowModel().rows[0]} />)
    expect(screen.getByText('€100')).toBeTruthy()
    expect(screen.getByText('net (0% tax)')).toBeTruthy()
    expect(screen.queryByText(/tax on/)).toBeNull()
    expect(screen.queryByText(/int\./)).toBeNull()
  })

  it('shows an unavailable marker when the position has no passive income', () => {
    const table = createTable<TableRow>({
      columns: [],
      data: [makePosition()],
      getCoreRowModel: getCoreRowModel(),
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
    })
    render(<PositionIncomeCell row={table.getRowModel().rows[0]} />)
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.queryByText(/tax/)).toBeNull()
  })
})
