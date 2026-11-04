import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })

async function diagnostics(code) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, 'src/main.tsx'),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === 'local/prefer-usecallback',
  )
}

describe('function memoization through the application configuration', () => {
  it.each([
    "import {useMemo} from 'react'; const action = useMemo(() => () => 1, [])",
    "import {useMemo as cache} from 'react'; const memo = cache; const action = memo(() => function run() {return 1}, [])",
    "import * as React from 'react'; const {useMemo: cache} = React; const action = cache(() => () => 1, [])",
    "import {useMemo} from 'react'; const build = () => () => 1; const action = useMemo(build, [])",
    "import {useMemo} from 'react'; function useAction(ready: boolean) {return useMemo(() => {if (ready) return () => 1; return () => 0}, [ready])}",
  ])(
    'rejects callable memo results: %s',
    async (code) => {
      expect(await diagnostics(code)).toMatchObject([
        {
          ruleId: 'local/prefer-usecallback',
          messageId: 'callback',
          severity: 2,
        },
      ])
    },
    30_000,
  )

  it.each([
    "import {useCallback} from 'react'; const action = useCallback(() => 1, [])",
    "import {useMemo} from 'react'; const model = useMemo(() => ({run: () => 1}), [])",
    "import {useMemo as cache} from 'react'; function run(cache: (build: () => () => number) => number) {return cache(() => () => 1)}",
    "import {useMemo} from 'react'; const model = useMemo(() => [1, 2], [])",
  ])(
    'preserves data and unrelated callbacks: %s',
    async (code) => {
      expect(await diagnostics(code)).toEqual([])
    },
    30_000,
  )
})
