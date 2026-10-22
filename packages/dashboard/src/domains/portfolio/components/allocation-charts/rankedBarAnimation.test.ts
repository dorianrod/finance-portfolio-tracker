import { describe, expect, it } from 'vitest'
import type { AnimationItem, BarRectangleItem } from 'recharts'
import { interpolateRankedBars } from './rankedBarAnimation'

function rectangle(key: string, y: number, width: number): BarRectangleItem {
  return {
    x: 260,
    y,
    width,
    height: 24,
    value: width,
    payload: { key },
    tooltipPosition: { x: 260 + width, y: y + 12 },
    parentViewBox: { x: 0, y: 0, width: 520, height: 300 },
    stackedBarStart: 260,
    originalDataIndex: 0,
  }
}

describe('interpolateRankedBars', () => {
  it('moves a matched holding between ranks without restarting its width at zero', () => {
    const items: AnimationItem<BarRectangleItem>[] = [{
      status: 'matched',
      prev: rectangle('A', 30, 80),
      next: rectangle('A', 0, 100),
    }]

    const [halfway] = interpolateRankedBars(items, 0.5, 'vertical')

    expect(halfway.y).toBe(15)
    expect(halfway.width).toBe(90)
    expect(halfway.width).toBeGreaterThan(0)
  })

  it('slides added and removed holdings below the ranking at full width', () => {
    const items: AnimationItem<BarRectangleItem>[] = [
      { status: 'removed', prev: rectangle('OUT', 0, 100) },
      { status: 'added', next: rectangle('IN', 30, 60) },
    ]

    const halfway = interpolateRankedBars(items, 0.5, 'vertical')
    const leaving = halfway.find((item) => item.payload?.key === 'OUT')
    const entering = halfway.find((item) => item.payload?.key === 'IN')

    expect(leaving).toMatchObject({ width: 100, opacity: 0.5 })
    expect(leaving!.y).toBeGreaterThan(0)
    expect(entering).toMatchObject({ width: 60, opacity: 0.5 })
    expect(entering!.y).toBeGreaterThan(30)

    const completed = interpolateRankedBars(items, 1, 'vertical')
    expect(completed.map((item) => item.payload?.key)).toEqual(['IN'])
    expect(completed[0]).toMatchObject({ y: 30, width: 60, opacity: 1 })
  })
})
