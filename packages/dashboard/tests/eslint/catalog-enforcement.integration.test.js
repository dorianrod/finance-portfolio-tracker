import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })
const feature = 'src/app/App.feature.tsx'
const view =
  'src/domains/portfolio/features/holdings/features/positions/components/GainCell.view.tsx'
const helper =
  'src/domains/portfolio/shared/helpers/transformers/resolveAssetName.ts'
const state = 'src/app/DashboardLoadState.state.tsx'

const cases = [
  {
    rule: 'component-role',
    file: feature,
    message: 'featureWithoutBusiness',
    invalid:
      "import text from '@/i18n/i18n'; const label = text.t; export function Field({value}: {value: string}) {return <span>{Boolean(value) ? label('ui.app.loading') : null}</span>}",
    valid:
      "import text from '@/i18n/i18n'; import {useAtomValue} from 'jotai'; import {dashboardFiltersOpenAtom} from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpen.atoms'; export function Field() {const open = useAtomValue(dashboardFiltersOpenAtom);return <span>{open ? text.t('ui.app.loading') : null}</span>}",
  },
  {
    rule: 'component-role',
    file: feature,
    message: 'featureWithoutBusiness',
    invalid:
      "import {useTranslation} from 'react-i18next'; export function Field() {const {t: label} = useTranslation();return <span>{label('ui.app.loading')}</span>}",
    valid:
      'export function Field({Boolean}: {Boolean: () => string}) {return <span>{Boolean()}</span>}',
  },
  {
    rule: 'component-role',
    file: view,
    message: 'viewImportsBusiness',
    invalid:
      "import { useAtomValue as read } from 'jotai'; export function Field() { return <span /> }",
    valid:
      "import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'; export function Field({row}: {row: PositionRow}) { return <span>{row.name}</span> }",
  },
  {
    rule: 'state-component-contract',
    file: state,
    message: 'stateUsesHook',
    invalid:
      "import { useState as state } from 'react'; export function Content() {const [value] = state(false); return <span>{value}</span>}",
    valid:
      'export function Content({state}) {switch(state.status) {case "loading": return null; case "ready": return state.content} const exhaustive: never = state; return exhaustive}',
  },
  {
    rule: 'i18n-consistency',
    message: 'defaultValue',
    invalid:
      "import text from '@/i18n/i18n'; export function Field() {return <span>{text.t('ui.app.loading', {defaultValue: 'Loading'})}</span>}",
    valid:
      "import text from '@/i18n/i18n'; export function Field() {return <span>{text.t('ui.app.loading')}</span>}",
  },
  {
    rule: 'max-hooks-per-component',
    message: 'tooManyHooks',
    invalid:
      "import {useState as state} from 'react'; export function Field() {state(0);state(0);state(0);state(0);state(0);state(0);state(0);return <span/>}",
    valid:
      "import {useState} from 'react'; export function Field() {const [value] = useState(0);return <span>{value}</span>}",
  },
  {
    rule: 'no-complex-component-calculation',
    message: 'extractCalculation',
    invalid:
      'export function Field({value, total}) {const percentage = value / total * 100; return <Meter value={Math.min(percentage, 100)} />}',
    valid: 'export function Field({value}) {return <Meter value={value} />}',
  },
  {
    rule: 'no-complex-jsx-condition',
    message: 'nameCondition',
    invalid:
      'export function Field({ready, value}) {return <>{ready && value != null && <Detail value={value}/>}</>}',
    valid:
      'export function Field({ready, value}) {const showDetails = ready && value != null; return <>{showDetails && <Detail value={value}/>}</>}',
  },
  {
    rule: 'no-complex-jsx-map',
    message: 'extractComponent',
    invalid:
      'export function List({rows}) {return <>{rows.map(row => {const selected = row.selected; return <Item selected={selected}/>})}</>}',
    valid:
      'export function List({rows}) {return <>{rows.map(row => <Item key={row.id} row={row}/>)}</>}',
  },
  {
    rule: 'no-component-data-pipeline',
    message: 'pipeline',
    invalid:
      'export function Field({rows}) {const total = rows.reduce((sum, row) => sum + row.amount, 0);return <span>{total}</span>}',
    valid:
      'export function Field({rows}) {const total = calculateTotal(rows);return <span>{total}</span>}',
  },
  {
    rule: 'no-component-module-logic',
    message: 'extractHelper',
    invalid:
      'function double(value: number) {return value * 2} export function Field({value}) {return <span>{double(value)}</span>}',
    valid: 'export function Field({value}) {return <span>{value}</span>}',
  },
  {
    rule: 'no-effects-in-components',
    message: 'extractEffect',
    invalid:
      "import {useEffect as synchronize} from 'react'; export function Field() {synchronize(() => {document.title = 'Example'}, []);return <span/>}",
    valid: 'export function Field() {useDocumentTitle();return <span/>}',
  },
  {
    rule: 'no-hardcoded-colors',
    message: 'color',
    invalid:
      "export function Field() {return <span style={{color: '#ff0033'}}/>}",
    valid: "export function Field() {return <Text tone='negative'/>}",
  },
  {
    rule: 'no-helper-context-params',
    message: 'context',
    invalid:
      "import {useFormatMoney as useCurrency} from '@/shared/helpers/formatters/useFormatMoney'; import {resolveAssetName as build} from '@/domains/portfolio/shared/helpers/transformers/resolveAssetName'; export function Field() {const format = useCurrency();return <span>{build({}, format)}</span>}",
    valid:
      "import {useFormatMoney as useCurrency} from '@/shared/helpers/formatters/useFormatMoney'; import {resolveAssetName as build} from '@/domains/portfolio/shared/helpers/transformers/resolveAssetName'; export function Field() {const format = useCurrency();return <span>{build({}, format(10))}</span>}",
  },
  {
    rule: 'no-inline-format-fallback',
    message: 'inputFallback',
    invalid:
      "import {useFormatMoney as useCurrency} from '@/shared/helpers/formatters/useFormatMoney'; export function Field({value}: {value: number | null}) {const format = useCurrency();return <span>{format(value ?? 0)}</span>}",
    valid:
      "import {useFormatMoney as useCurrency} from '@/shared/helpers/formatters/useFormatMoney'; export function Field({value}: {value: number | null}) {const format = useCurrency();return <span>{format(value, {fallback: 0})}</span>}",
  },
  {
    rule: 'no-inline-format-fallback',
    message: 'outputFallback',
    invalid:
      "import {useFormatMonthRange as usePeriod} from '@/domains/portfolio/features/wealth/helpers/formatters/useFormatMonthRange'; import text from '@/i18n/i18n'; export function Field({months}: {months:string[]}) {const format=usePeriod(); const label=format(months); return <span>{label || text.t('ui.wealthtab.insufficientHistory')}</span>}",
    valid:
      "import {useFormatMonthRange as usePeriod} from '@/domains/portfolio/features/wealth/helpers/formatters/useFormatMonthRange'; import text from '@/i18n/i18n'; export function Field({months}: {months:string[]}) {const format=usePeriod(); const label=format(months,{fallback:text.t('ui.wealthtab.insufficientHistory')}); return <span>{label}</span>}",
  },
  {
    rule: 'no-prop-drilling',
    message: 'derivedBusinessProp',
    invalid:
      "import {Child as Detail} from './Child.feature'; export function Field({value}) {return <Detail value={value + 1}/>}",
    valid:
      "import {Child as Detail} from './Child.view'; export function Field({value}) {return <Detail value={value + 1}/>}",
  },
  {
    rule: 'no-react-context',
    message: 'context',
    invalid:
      "import * as React from 'react'; const Selection = React.createContext(false); export function Field() {return <span/>}",
    valid:
      "import {createContext} from 'react'; export function run(createContext: () => object) {return createContext()}",
  },
  {
    rule: 'no-ui-string-concat',
    message: 'interpolation',
    invalid:
      "import {useFormatMoney} from '@/shared/helpers/formatters/useFormatMoney'; export function Field() {const format = useFormatMoney();return <span>{format(10) + ' total'}</span>}",
    valid:
      "import text from '@/i18n/i18n'; import {useFormatMoney} from '@/shared/helpers/formatters/useFormatMoney'; export function Field() {const format = useFormatMoney();return <span>{text.t('ui.portfoliochartsTooltips.totalWithValues', {amount: format(10)})}</span>}",
  },
  {
    rule: 'public-api-first',
    file: helper,
    message: 'first',
    invalid: "const FALLBACK = '';export function read() {return FALLBACK}",
    valid: "export function read() {return FALLBACK} const FALLBACK = ''",
  },
  {
    rule: 'public-api-first',
    file: helper,
    message: 'importsFirst',
    invalid:
      "export function read() {return 1} import type {PositionRow} from '@/domains/portfolio/shared/types/positionRow.type'",
    valid:
      "import type {PositionRow} from '@/domains/portfolio/shared/types/positionRow.type'; export function read(row: PositionRow) {return row.name}",
  },
]

async function diagnostics(rule, code, file = feature) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === `local/${rule}`,
  )
}

describe('catalog guards through the actual project configuration', () => {
  it('requires ref props instead of importing the React 19 forwardRef wrapper', async () => {
    const [result] = await eslint.lintText(
      "import {forwardRef as wrap} from 'react'; export const Field = wrap(() => null)",
      { filePath: resolve(directory, view) },
    )
    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'no-restricted-imports',
          severity: 2,
          message: expect.stringContaining('React 19'),
        }),
      ]),
    )
  }, 30_000)

  it('preserves typed ref props in React 19 components', async () => {
    const [result] = await eslint.lintText(
      "import type {Ref} from 'react'; export function Field({ref}: {ref?: Ref<HTMLInputElement>}) {return <input ref={ref}/>}",
      { filePath: resolve(directory, view) },
    )
    expect(
      result.messages.filter(
        (message) =>
          message.fatal || message.ruleId === 'no-restricted-imports',
      ),
    ).toEqual([])
  }, 30_000)

  it.each(cases)(
    'rejects the invalid $rule example with its own error',
    async ({ rule, file, invalid, message }) => {
      const messages = await diagnostics(rule, invalid, file)
      expect(messages.some((diagnostic) => diagnostic.fatal)).toBe(false)
      expect(messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ruleId: `local/${rule}`,
            messageId: message,
            severity: 2,
          }),
        ]),
      )
    },
    30_000,
  )

  it.each(cases)(
    'preserves the neighboring valid $rule example',
    async ({ rule, file, valid }) => {
      expect(await diagnostics(rule, valid, file)).toEqual([])
    },
    30_000,
  )
})

describe('resolved hook identity through the project configuration', () => {
  it.each([
    [
      "import * as React from 'react'; const {useState: read} = React;",
      'export function Field() {',
    ],
    [
      "import {useState as original} from 'react'; const read = original;",
      'export function Field() {',
    ],
    [
      "import {memo as cached, useState as read} from 'react';",
      'export const Field = cached(() => {',
    ],
  ])(
    'counts hooks through %s',
    async (prefix, declaration) => {
      const ending = declaration.includes('cached') ? '})' : '}'
      const code = `${prefix} ${declaration} ${'read(0);'.repeat(7)} return null; ${ending}`
      expect(await diagnostics('max-hooks-per-component', code)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ messageId: 'tooManyHooks', severity: 2 }),
        ]),
      )
    },
    30_000,
  )

  it.each([
    "import {use as read} from 'react'; export function Content({resource}) {return read(resource)}",
    "import * as React from 'react'; const {useState: read} = React; export function Content() {read(0);return null}",
  ])('keeps hooks out of state renderers: %s', async (code) => {
    expect(await diagnostics('state-component-contract', code, state)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageId: 'stateUsesHook', severity: 2 }),
      ]),
    )
  })

  it.each([
    "import {useState as read} from 'react'; export function Content({read}: {read: () => number}) {return read()}",
    "import * as React from 'react'; export function Content({React}: {React: {read: () => number}}) {return React.read()}",
  ])('preserves shadowed application callbacks: %s', async (code) => {
    expect(await diagnostics('state-component-contract', code, state)).toEqual(
      [],
    )
  })

  it.each([
    "import {useEffect as original} from 'react'; const run = original; export function Field() {run(() => {}, []);return null}",
    "import * as React from 'react'; const {useLayoutEffect: run} = React; export function Field() {run(() => {}, []);return null}",
  ])('finds aliased effects: %s', async (code) => {
    expect(await diagnostics('no-effects-in-components', code)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageId: 'extractEffect', severity: 2 }),
      ]),
    )
  })

  it('preserves an effect-shaped callback that shadows the React import', async () => {
    expect(
      await diagnostics(
        'no-effects-in-components',
        "import {useEffect as run} from 'react'; export function Field({run}: {run: () => void}) {run();return null}",
      ),
    ).toEqual([])
  })

  it('preserves numeric context arithmetic and technical identifiers', async () => {
    expect(
      await diagnostics(
        'no-ui-string-concat',
        "import {useQueryClient} from '@tanstack/react-query'; export function Field() {const client = useQueryClient();return <span>{client.isFetching() + 1}</span>}",
      ),
    ).toEqual([])
    expect(
      await diagnostics(
        'no-ui-string-concat',
        "import {useFormatMoney} from '@/shared/helpers/formatters/useFormatMoney'; export function Field() {const format = useFormatMoney();return <span id={format(10) + '-row'}/>}",
      ),
    ).toEqual([])
  })
})
