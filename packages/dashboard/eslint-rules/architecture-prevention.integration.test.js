import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

import { ESLint } from 'eslint'
import ts from 'typescript'
import { afterAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const root = mkdtempSync(join(tmpdir(), 'react-boundaries-'))
const files = {
  'src/domains/orders/components/Card.view.tsx':
    'export function Card() {return <span/>}',
  'src/domains/orders/components/Card.feature.tsx':
    'export function Card() {return <span/>}',
  'src/domains/orders/components/Panel.feature.tsx':
    'export function Panel() {return <span/>}',
  'src/domains/orders/components/Panel/services/usePanel.ts':
    'export function usePanel() {}',
  'src/domains/orders/components/Panel/helpers/calculators/total.ts':
    'export const total = 1',
  'src/domains/orders/services/useOrders.ts':
    'export function useOrders() {return []}',
  'src/domains/orders/helpers/mappers/toRow.ts':
    "import {useFormatOrder} from '../formatters/useFormatOrder'; export const toRow = useFormatOrder",
  'src/domains/orders/helpers/mappers/numeric.ts':
    'export const numeric = (value: number) => value * 2',
  'src/domains/orders/helpers/formatters/useFormatOrder.ts':
    'export function useFormatOrder() {return (value: string | null | undefined, options: {fallback?: string} = {}) => value ?? options.fallback ?? ""}',
  'src/domains/orders/helpers/barrel.ts':
    "export {Panel as Renamed} from '../components/Panel.feature'",
  'src/domains/orders/helpers/typesOnly.ts':
    "export type {Panel} from '../components/Panel.feature'",
  'src/domains/orders/helpers/cycleA.ts':
    "export {b} from './cycleB'; export const a = 1",
  'src/domains/orders/helpers/cycleB.ts':
    "export {a} from './cycleA'; export const b = 1",
  'src/domains/orders/helpers/cycleDisplay.ts':
    "export {a} from './cycleA'; export {toRow} from './mappers/toRow'",
}
for (const [file, code] of Object.entries(files)) {
  const name = join(root, file)
  mkdirSync(dirname(name), { recursive: true })
  writeFileSync(name, code)
}
const config = join(root, 'tsconfig.json')
writeFileSync(
  config,
  JSON.stringify({
    compilerOptions: {
      strict: true,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      paths: { '@/*': ['./src/*'] },
    },
  }),
)
const parsed = ts.getParsedCommandLineOfConfigFile(
  config,
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
)
let program = ts.createProgram(parsed.fileNames, parsed.options)
// Keep the application's real plugins, rule severities and processor. Only the
// typed program belongs to this portable fixture project.
const eslint = new ESLint({
  cwd: directory,
  overrideConfig: {
    languageOptions: {
      parserOptions: { projectService: false, programs: [program] },
    },
  },
})
afterAll(() => rmSync(root, { recursive: true, force: true }))

async function lint(
  rule,
  code,
  file = 'src/domains/orders/components/Card.view.tsx',
) {
  // An in-project file path selects the actual config. The parser program uses
  // the fixture path, so select the same config explicitly for this outside file.
  const config = {
    ...(await eslint.calculateConfigForFile(
      resolve(directory, 'src/app/App.feature.tsx'),
    )),
  }
  delete config.language
  writeFileSync(join(root, file), code)
  program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    oldProgram: program,
  })
  const configured = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [
      {
        ...config,
        languageOptions: {
          ...config.languageOptions,
          parserOptions: {
            ...config.languageOptions.parserOptions,
            programs: [program],
          },
        },
        files: ['**/*.{ts,tsx}'],
      },
    ],
  })
  const [result] = await configured.lintText(code, {
    filePath: join(root, file),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === `local/${rule}`,
  )
}

describe('architecture prevention through the configured rules', () => {
  it.each([
    "import('@/domains/orders/components/Panel.feature')",
    "import('@/domains/orders/helpers/barrel')",
    'import(`@/domains/orders/components/Panel.feature`)',
    "export {Renamed as Panel} from '@/domains/orders/helpers/barrel'",
  ])(
    'rejects feature dependencies through dynamic imports and barrels: %s',
    async (code) => {
      expect(await lint('component-role', code)).toMatchObject([
        { messageId: 'viewImportsFeature', severity: 2 },
      ])
    },
  )
  it.each([
    "import type {Panel} from '@/domains/orders/components/Panel.feature'",
    "export type {Panel} from '@/domains/orders/helpers/typesOnly'",
    "import {a} from '@/domains/orders/helpers/cycleA'; export function Card() {return <span>{a}</span>}",
  ])(
    'preserves erased dependencies and terminates on cycles: %s',
    async (code) => {
      expect(await lint('component-role', code)).toEqual([])
    },
  )
  it.each([
    "import {toRow as map} from '@/domains/orders/helpers/mappers/toRow'; export const rows = map",
    "export {toRow} from '@/domains/orders/helpers/mappers/toRow'",
    "import('@/domains/orders/helpers/cycleDisplay')",
  ])('rejects transitive formatting in reusable services: %s', async (code) => {
    const messages = await lint(
      'no-service-presentation',
      code,
      'src/domains/orders/services/useOrders.ts',
    )
    expect(messages).toMatchObject([{ messageId: 'presentation', severity: 2 }])
    expect(messages[0].message).toContain('useFormatOrder')
  })
  it('keeps component-owned presentation services valid', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {toRow} from '@/domains/orders/helpers/mappers/toRow'; export const rows = toRow",
        'src/domains/orders/components/Panel/services/usePanel.ts',
      ),
    ).toEqual([])
  })
  it('keeps calculations free of translation even inside a component', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {toRow} from '@/domains/orders/helpers/mappers/toRow'; export const rows = toRow",
        'src/domains/orders/components/Panel/helpers/calculators/total.ts',
      ),
    ).toMatchObject([{ messageId: 'presentation', severity: 2 }])
  })
  it('preserves numeric service dependencies', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {numeric} from '@/domains/orders/helpers/mappers/numeric'; export const rows = numeric",
        'src/domains/orders/services/useOrders.ts',
      ),
    ).toEqual([])
  })
  it('rejects visual-only features with local React state', async () => {
    expect(
      await lint(
        'component-role',
        "import {useState as state} from 'react'; export function Card() {const [open, setOpen] = state(false);return <button onClick={() => setOpen(true)}>{open}</button>}",
        'src/domains/orders/components/Card.feature.tsx',
      ),
    ).toMatchObject([{ messageId: 'featureWithoutBusiness', severity: 2 }])
  })
  it('preserves feature composition', async () => {
    expect(
      await lint(
        'component-role',
        "import {Panel} from './Panel.feature'; export function Card() {return <Panel/>}",
        'src/domains/orders/components/Card.feature.tsx',
      ),
    ).toEqual([])
  })
  it('rejects a plain formatter despite an exported alias', async () => {
    expect(
      await lint(
        'formatter-contract',
        'function label(value: {name: string}) {return value.name}; export {label as formatOrder}',
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toMatchObject([{ messageId: 'hook', severity: 2 }])
  })
  it('keeps nullable formatter hooks valid', async () => {
    expect(
      await lint(
        'formatter-contract',
        files['src/domains/orders/helpers/formatters/useFormatOrder.ts'],
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toEqual([])
  })
  it('rejects a formatter hook returning a non-callable value', async () => {
    expect(
      await lint(
        'formatter-contract',
        'export function useFormatOrder() {return 1}',
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toMatchObject([{ messageId: 'callable', severity: 2 }])
  })
  it('preserves named default formatter hooks', async () => {
    expect(
      await lint(
        'formatter-contract',
        'export default function useFormatOrder() {return (value: string | null | undefined, options: {fallback?: string} = {}) => value ?? options.fallback ?? ""}',
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toEqual([])
  })
  it('rejects an independent exported object hidden in a helper', async () => {
    expect(
      await lint(
        'entity-type-files',
        'export type Invoice = {reference: string}; export function total(value: number) {return value}',
        'src/domains/orders/helpers/mappers/numeric.ts',
      ),
    ).toMatchObject([{ messageId: 'misplaced', severity: 2 }])
  })
  it('preserves local helper input/output contracts', async () => {
    expect(
      await lint(
        'entity-type-files',
        'export type Options = {multiplier: number}; export function total(value: number, options: Options) {return value * options.multiplier}',
        'src/domains/orders/helpers/mappers/numeric.ts',
      ),
    ).toEqual([])
  })
})
