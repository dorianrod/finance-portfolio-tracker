import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

import { ESLint } from 'eslint'
import ts from 'typescript'
import { afterAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
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
  'src/domains/orders/components/Panel/helpers/transformers/total.ts':
    'export const total = 1',
  'src/domains/orders/components/Panel/helpers/presenters/tone.ts':
    "export const tone = 'positive'",
  'src/domains/orders/pages/detail/helpers/presenters/tone.ts':
    "export const tone = 'positive'",
  'src/domains/orders/helpers/presenters/tone.ts':
    "export const tone = 'positive'",
  'src/domains/components/features/summary/helpers/presenters/tone.ts':
    "export const tone = 'positive'",
  'src/domains/orders/services/useOrders.ts':
    'export function useOrders() {return []}',
  'src/domains/orders/helpers/transformers/toRow.ts':
    "import {useFormatOrder} from '../formatters/useFormatOrder'; export const toRow = useFormatOrder",
  'src/domains/orders/helpers/transformers/numeric.ts':
    'export const numeric = (value: number) => value * 2',
  'src/domains/orders/helpers/transformers/requestAdapter.ts':
    "export { schema as value } from '../../apis/schemas/orderSchema'",
  'src/domains/orders/apis/schemas/orderSchema.ts':
    "import { object } from 'yup'; export const schema = object()",
  'src/domains/orders/helpers/transformers/stateAdapter.ts':
    "export { value } from '../../stores/orders.atoms'",
  'src/domains/orders/stores/orders.atoms.ts': 'export const value = 1',
  'src/domains/orders/helpers/transformers/getOrderGroup.ts':
    "export const getOrderGroup = (code: string) => code === 'pending' || code === 'processing' ? 'inProgress' : 'closed'",
  'src/domains/orders/helpers/transformers/classifyError.ts':
    "import {ValidationError as InvalidData} from 'yup'; export const classifyError = (value: unknown) => value instanceof InvalidData ? 'invalid-data' : 'unexpected'",
  'src/domains/orders/helpers/transformers/mixedSchema.ts':
    "import {ValidationError, object} from 'yup'; export const schema = object(); export {ValidationError}",
  'src/domains/orders/helpers/transformers/globalLabels.ts':
    "import {t} from 'i18next'; export const label = t",
  'src/i18n/useTranslations.ts': "export {useTranslation} from 'react-i18next'",
  'src/domains/orders/helpers/transformers/group.ts':
    'export const group = (values: number[]) => values',
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
    "export {a} from './cycleA'; export {toRow} from './transformers/toRow'",
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
    "import { object as schema } from 'yup'; export const numeric = schema",
    "export { value as numeric } from '@/domains/orders/helpers/transformers/requestAdapter'",
    "import('@/domains/orders/helpers/transformers/stateAdapter')",
    "export * from '@/domains/orders/apis/schemas/orderSchema'",
    "export { schema as numeric } from '@/domains/orders/helpers/transformers/mixedSchema'",
    "import { useQuery as read } from '@tanstack/react-query'; export const numeric = read",
  ])(
    'rejects direct and indirect API, schema and business-state dependencies: %s',
    async (code) => {
      const messages = await lint(
        'helper-module-contract',
        code,
        'src/domains/orders/helpers/transformers/numeric.ts',
      )
      expect(messages).toMatchObject([{ messageId: 'dependency', severity: 2 }])
    },
  )

  it.each([
    "import type { ObjectSchema } from 'yup'; export type Schema = ObjectSchema<{}>",
    "export type { value } from '@/domains/orders/helpers/transformers/stateAdapter'",
    "import {getOrderGroup} from '@/domains/orders/helpers/transformers/getOrderGroup'; export const numeric = getOrderGroup",
    "import {classifyError} from '@/domains/orders/helpers/transformers/classifyError'; export const numeric = classifyError",
  ])(
    'preserves erased dependencies and pure classifications: %s',
    async (code) => {
      expect(
        await lint(
          'helper-module-contract',
          code,
          'src/domains/orders/helpers/transformers/numeric.ts',
        ),
      ).toEqual([])
    },
  )

  it.each([
    "import {useEffect as effect} from 'react'; export function numeric() { effect(() => {}, []) }",
    "import * as React from 'react'; const effect = React.useLayoutEffect; export function numeric() { effect(() => {}, []) }",
  ])('rejects effects through the application preset: %s', async (code) => {
    expect(
      await lint(
        'helper-module-contract',
        code,
        'src/domains/orders/helpers/transformers/numeric.ts',
      ),
    ).toMatchObject([{ messageId: 'effect', severity: 2 }])
  })

  it('preserves a formatter composing a pure business classification', async () => {
    const code =
      "import {useTranslation} from 'react-i18next'; import {getOrderGroup} from '@/domains/orders/helpers/transformers/getOrderGroup'; export function useFormatOrder() {const {t} = useTranslation(); return (value: string | null | undefined, {fallback = ''}: {fallback?: string} = {}): string => {if (value == null) return fallback; return getOrderGroup(value) === 'inProgress' ? t('orders.status.inProgress') : t('orders.status.closed')}}"
    expect(
      await lint(
        'helper-module-contract',
        code,
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toEqual([])
    expect(
      await lint(
        'formatter-contract',
        code,
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toEqual([])
  })

  it('keeps visual configuration dependencies out of formatters', async () => {
    expect(
      await lint(
        'helper-module-contract',
        "import {tone} from '@/domains/orders/components/Panel/helpers/presenters/tone'; export const useFormatOrder = tone",
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toMatchObject([{ messageId: 'displayOnly', severity: 2 }])
  })

  it.each([
    'src/domains/orders/helpers/transformers/numeric.ts',
    'src/domains/orders/helpers/formatters/useFormatOrder.ts',
    'src/domains/orders/components/Panel/helpers/presenters/tone.ts',
  ])('protects every helper contract from browser reads: %s', async (file) => {
    expect(
      await lint(
        'no-browser-in-pure-helpers',
        'export const width = window.innerWidth',
        file,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'local/no-browser-in-pure-helpers',
          messageId: 'browserContext',
          severity: 2,
        }),
      ]),
    )
    expect(
      await lint(
        'no-browser-in-pure-helpers',
        'export function width(rect: DOMRectReadOnly) {return rect.width}',
        file,
      ),
    ).toEqual([])
  })

  it.each([
    'src/domains/orders/helpers/presenters/tone.ts',
    'src/domains/components/features/summary/helpers/presenters/tone.ts',
  ])(
    'rejects visual helpers without a component or page owner: %s',
    async (file) => {
      expect(
        await lint('feature-folder-layout', files[file], file),
      ).toMatchObject([{ messageId: 'presenterScope', severity: 2 }])
    },
  )

  it.each([
    'src/domains/orders/components/Panel/helpers/presenters/tone.ts',
    'src/domains/orders/pages/detail/helpers/presenters/tone.ts',
  ])('preserves component- and page-owned visual helpers: %s', async (file) => {
    expect(await lint('feature-folder-layout', files[file], file)).toEqual([])
  })

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
    "import {toRow as map} from '@/domains/orders/helpers/transformers/toRow'; export const rows = map",
    "export {toRow} from '@/domains/orders/helpers/transformers/toRow'",
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
        "import {toRow} from '@/domains/orders/helpers/transformers/toRow'; export const rows = toRow",
        'src/domains/orders/components/Panel/services/usePanel.ts',
      ),
    ).toEqual([])
  })
  it.each([
    "import {t as label} from 'i18next'; export const group = label('orders.direct')",
    "export {toRow} from '@/domains/orders/helpers/transformers/toRow'",
    "import('@/domains/orders/helpers/cycleDisplay')",
  ])(
    'keeps aggregation identity independent of display labels: %s',
    async (code) => {
      expect(
        await lint(
          'no-service-presentation',
          code,
          'src/domains/orders/helpers/transformers/group.ts',
        ),
      ).toMatchObject([{ messageId: 'presentation', severity: 2 }])
    },
  )
  it('preserves numeric aggregations', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {numeric} from '@/domains/orders/helpers/transformers/numeric'; export const group = (values: number[]) => values.map(numeric)",
        'src/domains/orders/helpers/transformers/group.ts',
      ),
    ).toEqual([])
  })
  it('keeps calculations free of translation even inside a component', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {toRow} from '@/domains/orders/helpers/transformers/toRow'; export const rows = toRow",
        'src/domains/orders/components/Panel/helpers/transformers/total.ts',
      ),
    ).toMatchObject([{ messageId: 'presentation', severity: 2 }])
  })
  it('preserves numeric service dependencies', async () => {
    expect(
      await lint(
        'no-service-presentation',
        "import {numeric} from '@/domains/orders/helpers/transformers/numeric'; export const rows = numeric",
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
  it('rejects an aliased domain aggregator imported by a view', async () => {
    expect(
      await lint(
        'component-role',
        "import {group as aggregate} from '@/domains/orders/helpers/transformers/group'; export function Card() {return <span>{aggregate([])}</span>}",
      ),
    ).toMatchObject([{ messageId: 'viewImportsBusiness', severity: 2 }])
  })
  it.each([
    'function Caption() {return <span/>}',
    'function Caption({children: content}) {return content}',
  ])('rejects private presentation beside a feature: %s', async (caption) => {
    expect(
      await lint(
        'component-role',
        `import {Panel} from './Panel.feature'; ${caption}; export function Card() {return <><Panel/><Caption/></>}`,
        'src/domains/orders/components/Card.feature.tsx',
      ),
    ).toMatchObject([{ messageId: 'featureWithoutBusiness', severity: 2 }])
  })
  it('preserves private components with their own feature composition', async () => {
    expect(
      await lint(
        'component-role',
        "import {Panel} from './Panel.feature'; function Section() {return <Panel/>} export function Card() {return <Section/>}",
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
  it.each([
    "import {t as label} from 'i18next'",
    "import translations from '@/i18n/i18n'",
    "import {label} from '@/domains/orders/helpers/transformers/globalLabels'",
  ])(
    'requires formatter hooks to read the React translation context: %s',
    async (dependency) => {
      expect(
        await lint(
          'formatter-contract',
          `${dependency}; export function useFormatOrder() { return (value: string | null | undefined, {fallback = '—'}: {fallback?: string} = {}): string => value ?? fallback }`,
          'src/domains/orders/helpers/formatters/useFormatOrder.ts',
        ),
      ).toMatchObject([{ messageId: 'translationContext', severity: 2 }])
    },
  )
  it('preserves formatter hooks that read the provider translation instance', async () => {
    expect(
      await lint(
        'formatter-contract',
        "import {useTranslation as translations} from 'react-i18next'; export function useFormatOrder() {const {t} = translations(); return (value: string | null | undefined, {fallback = '—'}: {fallback?: string} = {}): string => value ?? t('orders.empty') ?? fallback}",
        'src/domains/orders/helpers/formatters/useFormatOrder.ts',
      ),
    ).toEqual([])
  })
  it.each([
    "import {useTranslation} from '@/i18n/useTranslations'",
    "import type {TFunction} from 'i18next'",
  ])(
    'preserves translation wrappers and erased type dependencies: %s',
    async (dependency) => {
      expect(
        await lint(
          'formatter-contract',
          `${dependency}; export function useFormatOrder() {return (value: string | null | undefined, {fallback = '—'}: {fallback?: string} = {}): string => value ?? fallback}`,
          'src/domains/orders/helpers/formatters/useFormatOrder.ts',
        ),
      ).toEqual([])
    },
  )
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
        'src/domains/orders/helpers/transformers/numeric.ts',
      ),
    ).toMatchObject([{ messageId: 'misplaced', severity: 2 }])
  })
  it('preserves local helper input/output contracts', async () => {
    expect(
      await lint(
        'entity-type-files',
        'export type Options = {multiplier: number}; export function total(value: number, options: Options) {return value * options.multiplier}',
        'src/domains/orders/helpers/transformers/numeric.ts',
      ),
    ).toEqual([])
  })
})
