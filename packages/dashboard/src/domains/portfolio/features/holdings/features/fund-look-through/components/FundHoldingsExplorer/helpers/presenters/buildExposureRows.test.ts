import { describe, expect, it } from 'vitest'

import { makeIssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerExposure.mock'

import { buildExposureRows } from './buildExposureRows'

describe('buildExposureRows', () => {
  it('adds security and multiple-source detail while retaining entity references', () => {
    const issuer = makeIssuerExposure()
    issuer.securities[0].sources.push({ fund: null, value: 20 })
    const rows = buildExposureRows([issuer], new Set([issuer.id]))
    expect(rows.map(({ kind }) => kind)).toEqual([
      'issuer',
      'security',
      'source',
      'source',
    ])
    expect(rows[0].issuer).toBe(issuer)
    expect(rows[1]).toMatchObject({ security: issuer.securities[0] })
    expect(buildExposureRows([issuer], new Set())).toEqual([
      { kind: 'issuer', issuer, open: false },
    ])
  })

  it('does not add redundant source rows for a single source', () => {
    const issuer = makeIssuerExposure()
    expect(
      buildExposureRows([issuer], new Set([issuer.id])).map(({ kind }) => kind),
    ).toEqual(['issuer', 'security'])
    expect(buildExposureRows([], new Set(['missing']))).toEqual([])
  })
})
