import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })

async function lint(code, file = 'src/app/App.feature.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === 'local/atom-contract',
  )
}

describe('atom contracts through the application configuration', () => {
  it.each([
    'src/shared/ui/stores/tooltipInput.atoms.ts',
    'src/app/stores/theme/dashboardTheme.store.ts',
  ])(
    'preserves explicitly owned exported atoms in %s',
    async (file) => {
      expect(
        await lint(
          "import {atom as make} from 'jotai'; export const selectedAtom = make<boolean>(false)",
          file,
        ),
      ).toEqual([])
    },
    30_000,
  )

  it('checks a separately exported immutable atom binding', async () => {
    expect(
      await lint(
        "import * as state from 'jotai'; const make = state.atom; const selected = make<boolean>(false); export {selected}",
      ),
    ).toMatchObject([{ messageId: 'file', severity: 2 }])
  }, 30_000)

  it.each([
    [
      "import {atom as create} from 'jotai'; export const selectedAtom = create<boolean>(false)",
      'file',
    ],
    ["import {atom} from 'jotai'; const value = atom('')", 'generic'],
    [
      "import {atom as make} from 'jotai'; const value = make<Set<string>>(new Set())",
      'default',
    ],
    [
      "import * as state from 'jotai'; const value = state.atom<{open: boolean}>({open: false})",
      'default',
    ],
    [
      "import {atomWithStorage} from 'jotai/utils'; const value = atomWithStorage<string[]>('items', [])",
      'default',
    ],
    [
      "import {atom} from 'jotai'; function Page() { const value = atom<string>(''); return null }",
      'render',
    ],
    [
      "import * as state from 'jotai'; const {atom: make} = state; function Page() { const value = make<string>(''); return null }",
      'render',
    ],
    [
      "import {atom} from 'jotai'; import {memo as cached} from 'react'; export const Page = cached(() => { const value = atom<string>(''); return null })",
      'render',
    ],
    [
      "import {atom} from 'jotai'; const useState = () => { const value = atom<string>(''); return value }",
      'render',
    ],
    [
      "import {atom} from 'jotai'; const create = atom; function Page() { const value = create<string>(''); return null }",
      'render',
    ],
    [
      "import {atom} from 'jotai'; import {useMemo} from 'react'; function Item() { const factory = useMemo(() => () => atom<string>(''), []); return null }",
      'render',
    ],
    [
      "import {atom} from 'jotai'; import {useMemo} from 'react'; function Item({id}: {id: string}) { const value = useMemo(() => atom<string>(''), [id]); return null }",
      'render',
    ],
  ])(
    'rejects %s',
    async (code, messageId) => {
      expect(await lint(code)).toMatchObject([
        { ruleId: 'local/atom-contract', messageId, severity: 2 },
      ])
    },
    30_000,
  )

  it.each([
    "import {atom} from 'jotai'; const value = atom<string>('')",
    "import {atom} from 'jotai'; const value = atom(false)",
    "import {atom} from 'jotai'; const DEFAULT_OPEN = false; const value = atom(DEFAULT_OPEN)",
    "import {atom} from 'jotai'; type Filters = {open: boolean}; const DEFAULT_FILTERS: Filters = {open: false}; const value = atom<Filters>(DEFAULT_FILTERS)",
    "import {atom} from 'jotai'; const count = atom(get => get(other).length)",
    "import {atom} from 'jotai'; const read = (get: (value: unknown) => number) => get(other); const count = atom(read)",
    "import {atom} from 'jotai'; import {useMemo as memo} from 'react'; function Item() { const value = memo(() => atom<boolean>(false), []); return null }",
    "import {atom} from 'jotai'; function createAtoms() { return atom<string>('') }",
    "import {atom} from 'jotai'; function useSomething(atom: (value: string) => string) { return atom('') }",
    'const store = {atom: (value: object) => value}; function useSomething() { return store.atom({}) }',
  ])(
    'preserves a valid neighboring contract: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
    30_000,
  )
})
