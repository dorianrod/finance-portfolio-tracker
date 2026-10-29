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
      'missing dictionary entries',
      `import {getOwnValue} from '${join(directory, 'src/shared/helpers/selectors/getOwnValue')}'`,
      "export const value: number = getOwnValue({present: 1}, 'missing')",
      "export const value: number = getOwnValue({present: 1}, 'missing') ?? 0",
    ],
  ])(
    'checks %s with the application compiler',
    (_name, imports, invalid, valid) => {
      expect(diagnostics(`${imports}; ${invalid}`)).toContain(2322)
      expect(diagnostics(`${imports}; ${valid}`)).toEqual([])
    },
  )
})
