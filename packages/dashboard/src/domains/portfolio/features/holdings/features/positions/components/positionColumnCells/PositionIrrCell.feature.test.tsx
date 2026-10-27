// @vitest-environment jsdom
import { createTable, getCoreRowModel } from '@tanstack/react-table'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { PositionIrrCell } from './PositionIrrCell.feature'

afterEach(cleanup)

describe('PositionIrrCell', () => {
  it.each([
    { overall: null, rolling: 6, expected: '3y: +6.00%/yr' },
    { overall: null, rolling: 0, expected: '3y: +0.00%/yr' },
    { overall: null, rolling: -4, expected: '3y: -4.00%/yr' },
    { overall: 8, rolling: null, expected: '3y: —' },
    { overall: 8, rolling: 6, expected: '3y: +6.00%/yr' },
  ])('displays overall=$overall and rolling=$rolling independently', (item) => {
    const table = createTable<TableRow>({
      columns: [],
      data: [
        makePosition({ xirr: item.overall, xirr_rolling_3y: item.rolling }),
      ],
      getCoreRowModel: getCoreRowModel(),
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
    })
    render(<PositionIrrCell row={table.getRowModel().rows[0]} />)
    expect(screen.getByText(item.expected)).toBeTruthy()
  })

  it('renders no return when both measures are missing', () => {
    const table = createTable<TableRow>({
      columns: [],
      data: [makePosition({ xirr: null, xirr_rolling_3y: null })],
      getCoreRowModel: getCoreRowModel(),
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
    })
    const { container } = render(
      <PositionIrrCell row={table.getRowModel().rows[0]} />,
    )
    expect(container.textContent).toBe('')
  })
})
