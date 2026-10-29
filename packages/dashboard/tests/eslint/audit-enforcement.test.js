import { resolve } from 'node:path'

import apiHookContract from '@frontend-engineering/react-best-practices/rules/api-hook-contract.js'
import entityTypeFiles from '@frontend-engineering/react-best-practices/rules/entity-type-files.js'
import noReturnedLocalState from '@frontend-engineering/react-best-practices/rules/no-returned-local-state.js'
import noSortForExtremum from '@frontend-engineering/react-best-practices/rules/no-sort-for-extremum.js'
import preferFunctionalStateUpdate from '@frontend-engineering/react-best-practices/rules/prefer-functional-state-update.js'
import { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })
const queryFile =
  'src/domains/portfolio/shared/apis/queries/useGetPortfolioHistoryQuery.ts'
const formatterFile = 'src/shared/helpers/formatters/useFormatMoney.ts'
const uiFile = 'src/shared/ui/Tooltip.view.tsx'

async function configured(rule, code, filename = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, filename),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === `local/${rule}`,
  )
}

function isolated(rule, implementation, code, filename) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: { parser: tseslint.parser },
      plugins: { local: { rules: { [rule]: implementation } } },
      rules: { [`local/${rule}`]: 'error' },
    },
    { filename },
  )
}

describe('API hook contract', () => {
  const lint = (code, filename = queryFile) =>
    isolated('api-hook-contract', apiHookContract, code, filename)
  it.each([
    'import {useQuery} from "@tanstack/react-query"; useQuery({queryFn: skipToken})',
    'import {useQuery as observe} from "@tanstack/react-query"; observe({})',
    'import * as query from "@tanstack/react-query"; query.useQuery({})',
    'import {useQuery} from "@tanstack/react-query"; const observe = useQuery; observe({})',
    'import {useMutation} from "@tanstack/react-query"; useMutation({})',
  ])('rejects observers outside the API layer: %s', (code) => {
    expect(
      lint(code, 'src/domains/portfolio/shared/services/useLabels.ts'),
    ).toMatchObject([{ messageId: 'location' }])
  })
  it.each(['usePortfolioHistoryQuery', 'useReadPortfolioHistoryQuery'])(
    'requires read intent in %s',
    (name) => {
      expect(
        lint(
          `import {useQuery} from "@tanstack/react-query"; export function ${name}() { return useQuery({}) }`,
        ),
      ).toMatchObject([{ messageId: 'name' }])
    },
  )
  it('checks filenames and variable-declared hooks', () => {
    expect(
      lint(
        'import {useQuery} from "@tanstack/react-query"; export const useGetOtherQuery = () => useQuery({})',
      ),
    ).toMatchObject([{ messageId: 'name' }])
  })
  it('allows read hooks and cache-only observers', () => {
    expect(
      lint(
        'import {useQuery} from "@tanstack/react-query"; export function useGetPortfolioHistoryQuery() { return useQuery({}) }',
      ),
    ).toEqual([])
    expect(
      lint(
        'import {skipToken, useQuery} from "@tanstack/react-query"; export function useCachedDashboardDataQuery() { return useQuery({queryFn: skipToken}) }',
        'src/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery.ts',
      ),
    ).toEqual([])
  })
  it.each([
    'queryKey: ["history", accounts]',
    'queryKey: keys.history(accounts)',
    'queryKey: keys.history(...accounts)',
  ])('requires an explicit scope-transition policy for %s', (key) => {
    expect(
      lint(
        `import {useQuery} from '@tanstack/react-query'; export function useGetPortfolioHistoryQuery(accounts: string[]) { return useQuery({${key}}) }`,
      ),
    ).toMatchObject([{ messageId: 'transition' }])
  })
  it('follows memoized selections into query keys', () => {
    expect(
      lint(
        `import {useQuery} from '@tanstack/react-query'; import {useMemo} from 'react'; export function useGetPortfolioHistoryQuery(accounts: string[]) { const selected = useMemo(() => accounts.toSorted(), [accounts]); return useQuery({queryKey: keys.history(selected)}) }`,
      ),
    ).toMatchObject([{ messageId: 'transition' }])
  })
  it.each(['keepPreviousData', 'undefined'])(
    'accepts an explicit %s transition policy',
    (policy) => {
      expect(
        lint(
          `import {useQuery} from '@tanstack/react-query'; export function useGetPortfolioHistoryQuery(accounts: string[]) { return useQuery({queryKey: ['history', accounts], placeholderData: ${policy}}) }`,
        ),
      ).toEqual([])
    },
  )
  it('does not require retention for selection-only parameters with a fixed cache key', () => {
    expect(
      lint(
        `import {useQuery} from '@tanstack/react-query'; export function useGetPortfolioHistoryQuery(isin: string) { return useQuery({queryKey: ['all-history'], select: data => data[isin]}) }`,
      ),
    ).toEqual([])
  })
  it('rejects a cached name for a fetching query', () => {
    expect(
      lint(
        'import {useQuery} from "@tanstack/react-query"; export function useCachedDashboardDataQuery() { return useQuery({queryFn: async () => []}) }',
        'src/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery.ts',
      ),
    ).toMatchObject([{ messageId: 'name' }])
  })
  it('respects shadowing and unrelated libraries', () => {
    expect(lint('import {useQuery} from "other"; useQuery({})')).toEqual([])
    expect(
      lint(
        'import {useQuery} from "@tanstack/react-query"; function call(useQuery) {useQuery({})}',
      ),
    ).toEqual([])
  })
  it('terminates for cyclic option aliases', () => {
    expect(
      lint(
        `import {useQuery} from '@tanstack/react-query'; const first = second; const second = first; export function useGetPortfolioHistoryQuery() {return useQuery(first)}`,
      ),
    ).toEqual([])
  })
})

describe('functional state updates', () => {
  const lint = (code) =>
    isolated(
      'prefer-functional-state-update',
      preferFunctionalStateUpdate,
      code,
      'src/Example.tsx',
    )
  it.each([
    'import {useState} from "react"; const [count, setCount] = useState(0); setCount(count + 1)',
    'import {useAtom} from "jotai"; const [filters, setFilters] = useAtom(atom); setFilters({...filters, active: true})',
    'import {useAtomValue, useSetAtom} from "jotai"; const filters = useAtomValue(atom); const setFilters = useSetAtom(atom); setFilters({...filters})',
    'import * as React from "react"; const [count, setCount] = React.useState(0); const next = count + 1; const save = setCount; save(next)',
  ])('rejects captured next values: %s', (code) => {
    expect(lint(code)).toMatchObject([{ messageId: 'captured' }])
  })
  it.each([
    'import {useState} from "react"; const [count, setCount] = useState(0); setCount(current => current + 1)',
    'import {useState} from "react"; const [count, setCount] = useState(0); setCount(2)',
    'import {useAtomValue, useSetAtom} from "jotai"; const source = useAtomValue(first); const setTarget = useSetAtom(second); setTarget(source)',
    'const setValue = value => value; setValue({filters: 1})',
  ])('allows independent assignments and updater callbacks: %s', (code) => {
    expect(lint(code)).toEqual([])
  })
  it('finds setters returned by action hooks using their resolved type', async () => {
    expect(
      await configured(
        'prefer-functional-state-update',
        `
      import {useAtomValue} from 'jotai'
      import {dashboardFiltersAtom} from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
      import {useDashboardFilters} from '@/domains/portfolio/features/scope-selection/services/actions/useDashboardFilters'
      const filters = useAtomValue(dashboardFiltersAtom)
      const {setFilters} = useDashboardFilters()
      setFilters({...filters, dateFrom: undefined})
    `,
      ),
    ).toMatchObject([{ messageId: 'captured', severity: 2 }])
  }, 30_000)
  it('allows assigning a different captured atom through an action hook', async () => {
    expect(
      await configured(
        'prefer-functional-state-update',
        `
      import {atom, useAtomValue} from 'jotai'
      import {useDashboardFilters} from '@/domains/portfolio/features/scope-selection/services/actions/useDashboardFilters'
      const backupAtom = atom({accounts: new Set<string>()})
      const backup = useAtomValue(backupAtom)
      const {setFilters} = useDashboardFilters()
      setFilters({...backup})
    `,
      ),
    ).toEqual([])
  })
  it('does not treat a static object key as a captured state read', () => {
    expect(
      lint(
        'import {useState} from "react"; const [count, setCount] = useState({count: 0}); setCount({count: 1})',
      ),
    ).toEqual([])
  })
  it('keeps identically named atoms in different lexical scopes distinct', () => {
    expect(
      lint(
        `import {useAtomValue, useSetAtom} from 'jotai'; const selected = atom(); const setTarget = useSetAtom(selected); function copy(selected) {const value = useAtomValue(selected); setTarget(value)}`,
      ),
    ).toEqual([])
  })
})

describe('formatter contracts through TypeScript', () => {
  it.each([
    ['number | null', '{fallback?: string}', 'string', ['nullable']],
    ['number | undefined', '{fallback?: string}', 'string', ['nullable']],
    ['number | null | undefined', '{}', 'string', ['fallback']],
    [
      'number | null | undefined',
      '{fallback?: string}',
      'string | null',
      ['string'],
    ],
    ['number', '{}', 'string', ['nullable', 'fallback']],
    ['unknown', '{fallback?: string}', 'string', []],
  ])(
    'validates input %s, options %s and output %s',
    async (input, options, output, expected) => {
      const messages = await configured(
        'formatter-contract',
        `export function useFormatMoney() { return (value: ${input}, options: ${options} = {}): ${output} => 'value' }`,
        formatterFile,
      )
      expect(messages.map((message) => message.messageId)).toEqual(expected)
    },
    30_000,
  )
  it('accepts aliases and destructured fallback options', async () => {
    expect(
      await configured(
        'formatter-contract',
        `type Options = {fallback?: string | number}; export function useFormatMoney() { return (value: number | null | undefined, {fallback = ''}: Options = {}): string => fallback.toString() }`,
        formatterFile,
      ),
    ).toEqual([])
  })
  it('allows a status parameter before the fallback options', async () => {
    expect(
      await configured(
        'formatter-contract',
        `export const useFormatMoney = () => (value: number | null | undefined, status: string, options: {fallback?: string} = {}): string => ''`,
        formatterFile,
      ),
    ).toEqual([])
  })
})

describe('literal formatter output', () => {
  it('allows formatters returning a closed union of display strings', async () => {
    expect(
      await configured(
        'formatter-contract',
        `export function useFormatMoney() {return (value: number | null | undefined, options: {fallback?: string} = {}): 'Ready' | 'Unknown' => value == null ? 'Unknown' : 'Ready'}`,
        formatterFile,
      ),
    ).toEqual([])
  })
})

describe('domain hook state ownership', () => {
  const lint = (
    code,
    filename = 'src/domains/example/services/useSelection.ts',
  ) => isolated('no-returned-local-state', noReturnedLocalState, code, filename)
  it.each([
    'return {selection, setSelection}',
    'return useMemo(() => ({selection, setSelection}), [selection])',
    'const choose = useCallback(next => setSelection(next), []); return {selection, choose}',
    'return useMemo(() => ({...resolve({selection}), setSelection}), [selection])',
  ])('rejects an exported local state/action pair: %s', (body) => {
    expect(
      lint(
        `import {useState, useMemo, useCallback} from 'react'; function useSelection() {const [selection, setSelection] = useState(null); ${body}}`,
      ),
    ).toMatchObject([{ messageId: 'shared' }])
  })
  it.each([
    'return {selection}',
    'return {setSelection}',
    'return useMemo(() => ({selection}), [selection, setSelection])',
  ])('allows encapsulated local or measurement state: %s', (body) => {
    expect(
      lint(
        `import {useState, useMemo} from 'react'; function useSelection() {const [selection, setSelection] = useState(null); ${body}}`,
      ),
    ).toEqual([])
  })
  it('allows reusable shared UI primitives', () => {
    expect(
      lint(
        `import {useState} from 'react'; function useSelection() {const [selection, setSelection] = useState(null); return {selection, setSelection}}`,
        'src/shared/ui/useSelection.ts',
      ),
    ).toEqual([])
  })
})

describe('numeric coercion', () => {
  it('rejects a numeric year converted through a string', async () => {
    expect(
      await configured(
        'no-number-string-roundtrip',
        'function year(date: Date) {return Number(String(date.getUTCFullYear()))}',
      ),
    ).toMatchObject([{ messageId: 'roundtrip', severity: 2 }])
  })
  it.each([
    'function convert(value: string) {return Number(String(value))}',
    'function convert(value: unknown) {return Number(String(value))}',
    'function convert(Number: (text: string) => number, value: number) {return Number(String(value))}',
  ])('preserves coercion that is not provably redundant: %s', async (code) => {
    expect(await configured('no-number-string-roundtrip', code)).toEqual([])
  })
})

describe('entity type files', () => {
  const lint = (code) =>
    isolated(
      'entity-type-files',
      entityTypeFiles,
      code,
      'src/domains/example/types/fundHolding.type.ts',
    )
  it('rejects independent status and diagnostic objects in an entity module', () => {
    expect(
      lint(
        'export type FundHolding = {name: string}; export type FundHoldingStatus = {valid: boolean}; export type FundSnapshot = {date: Date}',
      ),
    ).toMatchObject([
      { messageId: 'independent' },
      { messageId: 'independent' },
    ])
  })
  it('allows referenced sub-shapes, closed statuses and composed variants', () => {
    expect(
      lint(
        'export type Tier = "A" | "B"; export type FundHolding = {tier: Tier; source: Source}; export type Source = {name: string}; export type HistoricalFundHolding = FundHolding & {date: Date}',
      ),
    ).toEqual([])
  })
  it('rejects domain interfaces', () => {
    expect(lint('export interface FundHolding {name: string}')).toMatchObject([
      { messageId: 'alias' },
    ])
  })
  it('allows dependency interface augmentation', () => {
    expect(
      lint(
        "declare module '@tanstack/react-table' { interface TableMeta { columns: string[] } }",
      ),
    ).toEqual([])
  })
})

describe('extremum selection', () => {
  const lint = (code) =>
    isolated('no-sort-for-extremum', noSortForExtremum, code, 'src/select.ts')
  it.each([
    'rows.toSorted((a, b) => b.length - a.length)[0]',
    'rows.toSorted(compare).at(0)',
    'rows.toSorted(compare).at(-1)',
  ])('rejects %s', (expression) => {
    expect(lint(`const selected = ${expression}`)).toMatchObject([
      { messageId: 'extremum' },
    ])
  })
  it.each([
    'rows.toSorted(compare)',
    'rows.toSorted(compare).slice(0, 3)',
    'rows.reduce(selectMaximum)',
    'rows.toSorted()[0]',
  ])('allows %s', (expression) => {
    expect(lint(`const selected = ${expression}`)).toEqual([])
  })
})

describe('boolean validation', () => {
  it.each([
    `yup.boolean().transform((_value, original) => original === true || String(original).trim().toLowerCase() === 'true')`,
    `yup.boolean().transform((_value, original) => Boolean(original))`,
    `yup.boolean().transform((_value, original) => { return original === 'true' })`,
  ])('rejects transforms that erase invalid input: %s', async (expression) => {
    expect(
      await configured(
        'no-lossy-boolean-transform',
        `import * as yup from 'yup'; const schema = ${expression}`,
      ),
    ).toMatchObject([{ messageId: 'lossy', severity: 2 }])
  })
  it.each([
    `yup.boolean().transform((value: unknown, original: unknown) => { if (original === 'true') return true; if (original === 'false') return false; return value })`,
    `yup.boolean().transform((value: unknown, original: unknown) => original === '' ? undefined : value)`,
    `yup.string().transform((_value, original) => original === 'true')`,
    `({transform: (callback: Function) => callback}).transform((_value: unknown, original: unknown) => original === 'true')`,
  ])(
    'preserves validation and unrelated transforms: %s',
    async (expression) => {
      expect(
        await configured(
          'no-lossy-boolean-transform',
          `import * as yup from 'yup'; const schema = ${expression}`,
        ),
      ).toEqual([])
    },
  )
})

describe('shared UI callback and ref preservation', () => {
  it.each(['onClick', 'onMouseLeave', 'ref'])(
    'detects overwriting caller %s after a spread',
    async (name) => {
      expect(
        await configured(
          'no-overwritten-ui-props',
          `import type {ComponentProps} from 'react'; function Trigger(props: ComponentProps<'button'>) { return <button {...props} ${name}={() => {}} /> }`,
          uiFile,
        ),
      ).toMatchObject([{ messageId: 'overwritten', severity: 2 }])
    },
  )
  it.each([
    `return <button {...props} onClick={event => props.onClick?.(event)} />`,
    `const click = event => props.onClick?.(event); return <button {...props} onClick={click} />`,
    `return <button onClick={() => {}} {...props} />`,
    `return <button {...props} title='Fixed title' />`,
  ])('allows forwarding and other attributes: %s', async (body) => {
    expect(
      await configured(
        'no-overwritten-ui-props',
        `import type {ComponentProps} from 'react'; function Trigger(props: ComponentProps<'button'>) { ${body} }`,
        uiFile,
      ),
    ).toEqual([])
  })
  it('honors handlers and refs removed from the spread by destructuring', async () => {
    expect(
      await configured(
        'no-overwritten-ui-props',
        `import type {ComponentProps} from 'react'; function Trigger({ref, onClick, ...props}: ComponentProps<'button'>) { return <button {...props} ref={ref} onClick={() => onClick?.({} as never)} /> }`,
        uiFile,
      ),
    ).toEqual([])
  })
  it('honors handlers intentionally omitted from the public API', async () => {
    expect(
      await configured(
        'no-overwritten-ui-props',
        `import type {ComponentProps} from 'react'; function Trigger(props: Omit<ComponentProps<'button'>, 'onClick'>) { return <button {...props} onClick={() => {}} /> }`,
        uiFile,
      ),
    ).toEqual([])
  })
})

describe('configured enforcement scope', () => {
  it('enables the API check as an error', async () => {
    expect(
      await configured(
        'api-hook-contract',
        `import {useQuery} from '@tanstack/react-query'; useQuery({queryKey: ['probe']})`,
      ),
    ).toMatchObject([{ messageId: 'location', severity: 2 }])
  })
  it.each([
    'api-hook-contract',
    'prefer-functional-state-update',
    'formatter-contract',
    'entity-type-files',
    'no-lossy-boolean-transform',
    'no-overwritten-ui-props',
  ])('leaves test fixtures outside %s', async (rule) => {
    expect(
      await configured(
        rule,
        `import {useQuery} from '@tanstack/react-query'; useQuery({queryKey: ['fixture']})`,
        'src/shared/ui/Tooltip.view.test.tsx',
      ),
    ).toEqual([])
  })
})
