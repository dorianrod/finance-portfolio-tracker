import { describe, expect, it } from 'vitest'
import type { PositionRow } from '@/types/domain'
import { isAssetAnalysisApplicablePosition } from './accountApplicability'

function position(account_category: string, account_type: string): PositionRow {
  return { account_category, account_type } as PositionRow
}

describe('asset-analysis account applicability', () => {
  it('excludes savings, checking and synthetic brokerage cash', () => {
    expect(isAssetAnalysisApplicablePosition(position('savings', 'Livret'))).toBe(false)
    expect(isAssetAnalysisApplicablePosition(position('checking', 'Compte courant'))).toBe(false)
    expect(isAssetAnalysisApplicablePosition(position('brokerage', 'Bourse – Cash'))).toBe(false)
  })

  it('keeps invested brokerage positions applicable', () => {
    expect(isAssetAnalysisApplicablePosition(position('brokerage', 'Bourse'))).toBe(true)
  })
})
