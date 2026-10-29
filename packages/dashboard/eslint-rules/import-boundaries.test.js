import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { businessBoundaryViolation } from './business-ownership.js'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })
const sharedFile = 'src/shared/helpers/mappers/toCalendarMonth.ts'
const domainFile =
  'src/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId.ts'
const serviceFile =
  'src/domains/portfolio/features/holdings/features/positions/services/actions/useDashboardPositionSort.ts'

async function lint(code, file) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === 'local/import-boundaries',
  )
}

describe('configured import boundaries', () => {
  it.each([
    "import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'",
    "export * from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison'",
    "const comparison = import('@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison')",
    "type Comparison = import('@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types').OverviewComparison",
    "import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'",
  ])(
    'rejects sibling feature dependencies: %s',
    async (code) => {
      expect(await lint(code, serviceFile)).toMatchObject([
        { messageId: 'siblingFeature', severity: 2 },
      ])
    },
    20_000,
  )

  it.each([
    "import { useCurrentConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/useCurrentConcentration'",
    "import type { HoldingConcentration } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'",
  ])(
    'does not expose child implementation to parent shared contracts: %s',
    async (code) => {
      expect(
        await lint(
          code,
          'src/domains/portfolio/features/diversification/shared/types/diversificationInputs.type.ts',
        ),
      ).toMatchObject([{ messageId: 'sharedScope', severity: 2 }])
    },
    20_000,
  )

  it('keeps parent shared contracts independent of child renderers', async () => {
    expect(
      await lint(
        "import { ConcentrationSection } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationSection.feature'",
        'src/domains/portfolio/features/diversification/shared/types/diversificationInputs.type.ts',
      ),
    ).toMatchObject([{ messageId: 'sharedScope', severity: 2 }])
  })

  it('rejects dependencies between nested sibling capabilities', async () => {
    expect(
      await lint(
        "import { useCurrentConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/useCurrentConcentration'",
        'src/domains/portfolio/features/diversification/features/allocation/helpers/mappers/useAllocationCharts.ts',
      ),
    ).toMatchObject([{ messageId: 'siblingFeature', severity: 2 }])
  })

  it('allows parent composition and ancestor shared contracts', async () => {
    expect(
      await lint(
        "import { CurrentConcentration } from '@/domains/portfolio/features/diversification/features/concentration/components/CurrentConcentration.feature'",
        'src/app/DashboardDiversification.feature.tsx',
      ),
    ).toEqual([])
    expect(
      await lint(
        "import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'",
        'src/domains/portfolio/features/diversification/features/allocation/helpers/mappers/useAllocationCharts.ts',
      ),
    ).toEqual([])
  })

  it.each([
    "import { HISTORY } from '@/shared/ui/storybook/fixtures'",
    "import { HISTORY } from '../../ui/storybook/fixtures'",
    "export * from '@/shared/ui/storybook/fixtures'",
    "const examples = import('@/shared/ui/storybook/fixtures')",
  ])(
    'rejects production dependencies on Storybook: %s',
    async (code) => {
      expect(await lint(code, sharedFile)).toMatchObject([
        { messageId: 'storybook', severity: 2 },
      ])
    },
    20_000,
  )

  it.each([
    [
      'alias',
      "import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'",
    ],
    [
      'relative path',
      "import type { PositionRow } from '../../../domains/portfolio/shared/types/positionRow.type'",
    ],
    [
      'normalized alias',
      "import type { PositionRow } from '@/shared/../domains/portfolio/shared/types/positionRow.type'",
    ],
    [
      'application',
      "import type { DashboardLoadState } from '@/app/types/dashboardLoadState.type'",
    ],
    [
      'named re-export',
      "export type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'",
    ],
    [
      'export all',
      "export * from '../../../domains/portfolio/shared/types/positionRow.type'",
    ],
    [
      'dynamic import',
      "const data = import('../../../domains/portfolio/shared/types/positionRow.type')",
    ],
    [
      'import type query',
      "type Row = import('../../../domains/portfolio/shared/types/positionRow.type').PositionRow",
    ],
    [
      'import equals',
      "import rows = require('../../../domains/portfolio/shared/types/positionRow.type')",
    ],
  ])(
    'rejects shared-to-business dependencies through %s',
    async (_name, code) => {
      expect(await lint(code, sharedFile)).toMatchObject([
        { messageId: 'shared', severity: 2 },
      ])
    },
    20_000,
  )

  it.each([
    "import { queryClient } from '@/app/queryClient'",
    "import { queryClient } from '../../../../../../app/queryClient'",
    "export { queryClient } from '@/app/queryClient'",
    "const client = import('@/app/queryClient')",
  ])('rejects domain-to-application dependencies: %s', async (code) => {
    expect(await lint(code, domainFile)).toMatchObject([
      { messageId: 'application', severity: 2 },
    ])
  })

  it.each([
    "import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'",
    "const renderer = import('@/domains/portfolio/features/overview/pages/OverviewTab.feature')",
  ])('keeps shared ownership above its descendants: %s', async (code) => {
    expect(await lint(code, domainFile)).toMatchObject([
      { messageId: 'sharedScope', severity: 2 },
    ])
  })

  it.each([
    "import { HoverChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'",
    "import type { HoverChart } from '../../components/PositionHoverDetails/HoverChart.feature'",
    "import type { HoverChart } from '../../components/PositionHoverDetails/HoverChart.feature.js'",
    "export { HoverChart } from '../../components/PositionHoverDetails/HoverChart.feature'",
    "export * from '../../components/PositionHoverDetails/HoverChart.feature'",
    "const chart = import('../../components/PositionHoverDetails/HoverChart.feature')",
    "type Chart = typeof import('../../components/PositionHoverDetails/HoverChart.feature').HoverChart",
    "import type { Button } from '@/shared/ui/controls/Button.view'",
  ])('rejects renderer dependencies in services: %s', async (code) => {
    expect(await lint(code, serviceFile)).toMatchObject([
      { messageId: 'component', severity: 2 },
    ])
  })

  it.each([
    'src/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations/getPositionTradeOperations.ts',
    'src/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreview.atoms.ts',
    'src/domains/portfolio/features/holdings/features/positions/types/chartTarget.type.ts',
    'src/domains/portfolio/shared/apis/queries/useGetPositionsQuery.ts',
    'src/shared/schemas/finiteNumber.schema.ts',
    'src/app/helpers/mappers/useBuildDashboardLoadState.ts',
  ])('checks the non-UI layer %s', async (file) => {
    expect(
      await lint(
        "import type { Button } from '@/shared/ui/controls/Button.view'",
        file,
      ),
    ).toMatchObject([{ messageId: 'component', severity: 2 }])
  })

  it('does not let a component helper become a feature-level dependency', async () => {
    expect(
      await lint(
        "import { computeMonthlyBalances } from '../../components/PositionHoverDetails/helpers/calculators/buildHoverChartData/computeMonthlyBalances'",
        serviceFile,
      ),
    ).toMatchObject([{ messageId: 'componentLogic', severity: 2 }])
  })

  it.each([
    [
      serviceFile,
      "import type { ChartTarget } from '../../types/chartTarget.type'",
    ],
    [serviceFile, "import type { RefObject } from 'react'"],
    [
      serviceFile,
      "import { useDelayedDismiss } from '@/shared/ui/services/useDelayedDismiss'",
    ],
    [
      domainFile,
      "import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'",
    ],
    [
      'src/app/routing/dashboardTabLoaders/preloadDashboardTab.ts',
      "const panel = import('@/domains/portfolio/features/overview/pages/OverviewTab.feature')",
    ],
    [
      'src/app/App.feature.tsx',
      "import { OverviewTab } from '@/domains/portfolio/features/overview/pages/OverviewTab.feature'",
    ],
    [
      'src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/helpers/presenters/getAccountTypeLeaderLine.ts',
      "import { getAccountTypeSplitRadius } from './getAccountTypeSplitRadius'",
    ],
    [
      'src/shared/ui/controls/Button.view.tsx',
      "import { Tooltip } from '@/shared/ui/Tooltip.view'",
    ],
    [
      'src/shared/helpers/calculators/partitionPercentages.test.ts',
      "import { queryClient } from '@/app/queryClient'",
    ],
  ])(
    'allows dependencies inside their ownership boundary: %s',
    async (file, code) => {
      expect(await lint(code, file)).toEqual([])
    },
  )
})

describe('business ownership paths', () => {
  it.each([
    [
      'domains/orders/services/load.ts',
      'domains/contracts/types/contract.ts',
      'businessDomain',
    ],
    [
      'domains/sales/orders/services/load.ts',
      'domains/sales/invoices/types/invoice.ts',
      'siblingFeature',
    ],
    [
      'domains/sales/orders/services/load.ts',
      'domains/sales/shared/types/account.ts',
      null,
    ],
    [
      'domains/portfolio/features/holdings/features/positions/services/load.ts',
      'domains/portfolio/features/holdings/services/private.ts',
      'ancestorFeature',
    ],
    [
      'domains/portfolio/features/holdings/features/positions/services/load.ts',
      'domains/portfolio/features/holdings/shared/types/holding.ts',
      null,
    ],
    [
      'domains/portfolio/features/holdings/shared/components/Holdings.tsx',
      'domains/portfolio/features/holdings/features/positions/services/load.ts',
      'sharedScope',
    ],
    [
      'app/services/load.ts',
      'domains/portfolio/features/holdings/types/holding.ts',
      null,
    ],
  ])('checks %s → %s', (source, target, expected) => {
    expect(businessBoundaryViolation(source, target)).toBe(expected)
  })
})
