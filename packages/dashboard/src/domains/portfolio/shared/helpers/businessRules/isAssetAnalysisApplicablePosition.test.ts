import { describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { isAssetAnalysisApplicablePosition } from './isAssetAnalysisApplicablePosition'

describe('asset-analysis account applicability', () => {
  it.each([
    { category: 'savings', type: 'Livret', applicable: false },
    { category: 'checking', type: 'Compte courant', applicable: false },
    { category: 'brokerage', type: 'Bourse – Cash', applicable: false },
    { category: 'brokerage', type: 'Bourse', applicable: true },
  ])(
    'classifies $category / $type as applicable=$applicable',
    ({ category, type, applicable }) => {
      expect(
        isAssetAnalysisApplicablePosition(
          makePosition({ account_category: category, account_type: type }),
        ),
      ).toBe(applicable)
    },
  )
})
