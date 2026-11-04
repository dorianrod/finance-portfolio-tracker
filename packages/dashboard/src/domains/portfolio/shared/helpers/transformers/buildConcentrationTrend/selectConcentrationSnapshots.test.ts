import { describe, expect, it } from 'vitest'

import { selectConcentrationSnapshots } from './selectConcentrationSnapshots'

describe('selectConcentrationSnapshots', () => {
  it('selects the latest eligible snapshots at each endpoint, in chronological order', () => {
    const snapshots: Array<[number, string]> = [
      [30, 'last'],
      [10, 'first'],
      [20, 'middle'],
    ]
    expect(
      selectConcentrationSnapshots(snapshots, [
        new Date(35),
        new Date(10),
        new Date(25),
        new Date(25),
      ]),
    ).toEqual([
      [10, 'first'],
      [20, 'middle'],
      [30, 'last'],
    ])
    expect(snapshots[0]).toEqual([30, 'last'])
  })

  it('preserves full-series behavior when no endpoints are supplied', () => {
    expect(
      selectConcentrationSnapshots([
        [20, 'last'],
        [10, 'first'],
      ]),
    ).toEqual([
      [10, 'first'],
      [20, 'last'],
    ])
  })

  it('does not invent snapshots before available history or for empty endpoints', () => {
    expect(
      selectConcentrationSnapshots([[10, 'first']], [new Date(9)]),
    ).toEqual([])
    expect(selectConcentrationSnapshots([[10, 'first']], [])).toEqual([])
    expect(selectConcentrationSnapshots([], [new Date(20)])).toEqual([])
  })
})
