import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { ESLint } from 'eslint'
import ts from 'typescript'
import { afterAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })
const root = mkdtempSync(join(tmpdir(), 'typescript-safety-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))

async function lint(rule, code) {
  const [result] = await eslint.lintText(code, {
    filePath: join(directory, 'src/app/App.feature.tsx'),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === `@typescript-eslint/${rule}`,
  )
}

describe('typed ESLint safety through the application configuration', () => {
  it.each([
    ['no-floating-promises', 'Promise.resolve(1)', 'void Promise.resolve(1)'],
    [
      'await-thenable',
      'async function read() {return await 1}',
      'async function read() {return await Promise.resolve(1)}',
    ],
    [
      'no-unsafe-argument',
      "function accept(value: number) {} accept(JSON.parse('1'))",
      'function accept(value: number) {} accept(1)',
    ],
    [
      'no-unsafe-member-access',
      "JSON.parse('{}').name",
      "const value: unknown = JSON.parse('{}'); if (typeof value === 'object' && value !== null && 'name' in value) console.log(value.name)",
    ],
    [
      'switch-exhaustiveness-check',
      "function read(value: 'a' | 'b') {switch(value) {case 'a': return 1}}",
      "function read(value: 'a' | 'b') {switch(value) {case 'a': return 1; case 'b': return 2}}",
    ],
    [
      'consistent-type-imports',
      "import {ReactNode} from 'react'; const children: ReactNode = null",
      "import type {ReactNode} from 'react'; const children: ReactNode = null",
    ],
  ])(
    'rejects unsafe code and preserves its valid neighbor: %s',
    async (rule, invalid, valid) => {
      expect(await lint(rule, invalid)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ruleId: `@typescript-eslint/${rule}`,
            severity: 2,
          }),
        ]),
      )
      expect(await lint(rule, valid)).toEqual([])
    },
    30_000,
  )
})

describe('compiler safety from both project configurations', () => {
  it.each(['tsconfig.app.json', 'tsconfig.node.json'])(
    'keeps strict and additional semantic checks in %s',
    (configFile) => {
      const config = ts.getParsedCommandLineOfConfigFile(
        join(directory, configFile),
        {},
        { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
      )
      expect(config.options).toMatchObject({
        strict: true,
        noImplicitReturns: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
      })
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
      expect(
        diagnostics(
          'export function choose(value: boolean) {if (value) return 1}',
        ),
      ).toContain(7030)
      expect(
        diagnostics(
          'class Parent {read() {return 1}} export class Child extends Parent {read() {return 2}}',
        ),
      ).toContain(4114)
      expect(
        diagnostics(
          'export function read(values: Record<string, number>) {return values.missing}',
        ),
      ).toContain(4111)
      expect(
        diagnostics(
          "export function read(values: Record<string, number>, ready: boolean) {if (ready) return values['missing']; return undefined} class Parent {read() {return 1}} export class Child extends Parent {override read() {return 2}}",
        ),
      ).toEqual([])
    },
    30_000,
  )
})
