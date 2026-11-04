import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import ts from 'typescript'
import { afterAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const root = mkdtempSync(join(tmpdir(), 'domain-contracts-'))
const config = ts.getParsedCommandLineOfConfigFile(
  join(directory, 'tsconfig.app.json'),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
)
afterAll(() => rmSync(root, { recursive: true, force: true }))

function diagnostics(code) {
  const file = join(root, 'example.ts')
  writeFileSync(file, code)
  const program = ts.createProgram([file], {
    ...config.options,
    types: [],
    noEmit: true,
    incremental: false,
  })
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName === file)
    .map((diagnostic) => diagnostic.code)
}

describe('domain boundary compiler contracts', () => {
  // Chart props resolve the full Recharts type graph alongside other typed suites.
  it.each([
    [
      'account categories',
      `import type {AccountCategory} from '${join(directory, 'src/domains/portfolio/shared/types/accountCategory.type')}'`,
      "export const category: AccountCategory = 'not-a-category'",
      "export const category: AccountCategory = 'brokerage'",
    ],
    [
      'typed chart label selectors',
      `import {ChartLabels} from '${join(directory, 'src/shared/ui/chartLabels/ChartLabels.view')}'`,
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = (point: {value: string}) => point.value',
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = point => point.value.toFixed(1)',
    ],
    [
      'display-ready chart label results',
      `import {ChartLabels} from '${join(directory, 'src/shared/ui/chartLabels/ChartLabels.view')}'`,
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = point => point.value',
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = point => point.value.toFixed(1)',
    ],
    [
      'chart label field access',
      `import {ChartLabels} from '${join(directory, 'src/shared/ui/chartLabels/ChartLabels.view')}'`,
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = point => point.missing',
      'export const label: Parameters<typeof ChartLabels<{value: number}>>[0]["label"] = point => point.value.toFixed(1)',
      2339,
    ],
    [
      'resource-specific query scopes',
      `import {portfolioQueryKeys} from '${join(directory, 'src/domains/portfolio/shared/apis/queryKeys')}'`,
      'portfolioQueryKeys.data("passive-income", "pea", new Date("2026-01-01"), undefined)',
      'portfolioQueryKeys.data("passive-income", ["pea"], new Date("2026-01-01"), undefined)',
      2345,
    ],
    [
      'unscoped query resources',
      `import {portfolioQueryKeys} from '${join(directory, 'src/domains/portfolio/shared/apis/queryKeys')}'`,
      'portfolioQueryKeys.data("dashboard", {scope: "unexpected"})',
      'portfolioQueryKeys.data("dashboard")',
      2554,
    ],
    [
      'missing dictionary entries',
      `import {getOwnValue} from '${join(directory, 'src/shared/helpers/transformers/getOwnValue')}'`,
      "export const value: number = getOwnValue({present: 1}, 'missing')",
      "export const value: number = getOwnValue({present: 1}, 'missing') ?? 0",
    ],
    [
      'prepared account breakdown denominators',
      `import {AccountTypeBreakdownChartView} from '${join(directory, 'src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.view')}'`,
      'export const props: Parameters<typeof AccountTypeBreakdownChartView>[0] = {data: [], children: null}',
      'export const props: Parameters<typeof AccountTypeBreakdownChartView>[0] = {data: [], portfolioTotal: 0, children: null}',
      2741,
    ],
    [
      'prepared account history totals',
      `import {AccountTypeHistoryChartView} from '${join(directory, 'src/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryChart.view')}'`,
      'export const props: Parameters<typeof AccountTypeHistoryChartView>[0] = {data: [{date: new Date("2026-01-31"), values: {Savings: 100}, shares: [100]}], accountTypes: ["Savings"], typeCategories: {}, children: null}',
      'export const props: Parameters<typeof AccountTypeHistoryChartView>[0] = {data: [{date: new Date("2026-01-31"), values: {Savings: 100}, total: 100, shares: [100]}], accountTypes: ["Savings"], typeCategories: {}, children: null}',
      2322,
    ],
    [
      'prepared evolution metrics',
      `import {EvolutionChartView} from '${join(directory, 'src/domains/portfolio/features/wealth/components/EvolutionChart/EvolutionChart.view')}'; import {makePortfolioHistoryPoint} from '${join(directory, 'src/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock')}'`,
      'export const props: Parameters<typeof EvolutionChartView>[0] = {history: [makePortfolioHistoryPoint()], children: null}',
      'export const props: Parameters<typeof EvolutionChartView>[0] = {history: [{date: makePortfolioHistoryPoint().date, composition: {cost: 80, gain: 20, total: 100, costShare: 80, gainShare: 20}}], children: null}',
      2322,
    ],
  ])(
    'checks %s with the application compiler',
    (_name, imports, invalid, valid, expectedCode = 2322) => {
      expect(diagnostics(`${imports}; ${invalid}`)).toContain(expectedCode)
      expect(diagnostics(`${imports}; ${valid}`)).toEqual([])
    },
    30_000,
  )
})
