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
      `import {getOwnValue} from '${join(directory, 'src/shared/helpers/selectors/getOwnValue')}'`,
      "export const value: number = getOwnValue({present: 1}, 'missing')",
      "export const value: number = getOwnValue({present: 1}, 'missing') ?? 0",
    ],
  ])(
    'checks %s with the application compiler',
    (_name, imports, invalid, valid, expectedCode = 2322) => {
      expect(diagnostics(`${imports}; ${invalid}`)).toContain(expectedCode)
      expect(diagnostics(`${imports}; ${valid}`)).toEqual([])
    },
  )
})
