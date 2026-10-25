import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardDirectory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: dashboardDirectory })

async function lint(code, filename = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(dashboardDirectory, filename),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === '@typescript-eslint/no-deprecated',
  )
}

describe('configured deprecated API enforcement', () => {
  it.each([
    [
      'a browser method',
      "window.matchMedia('(min-width: 768px)').addListener(() => {})",
    ],
    ['a string method', "'portfolio'.substr(1)"],
    [
      'an aliased dependency component',
      "import { Cell as LegacyCell } from 'recharts'; const element = <LegacyCell />; void element",
    ],
    [
      'a dependency client method',
      "import { QueryClient } from '@tanstack/react-query'; new QueryClient().ensureQueryData({ queryKey: ['positions'], queryFn: async () => [] })",
    ],
    [
      'a deprecated component prop',
      "import { Pie } from 'recharts'; const element = <Pie activeShape={false} />; void element",
    ],
  ])(
    'rejects %s through the real ESLint configuration',
    async (_name, code) => {
      const messages = await lint(code)
      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        ruleId: '@typescript-eslint/no-deprecated',
        severity: 2,
      })
    },
    // The first typed lint initializes the project's TypeScript programs.
    20_000,
  )

  it.each([
    "window.matchMedia('(min-width: 768px)').addEventListener('change', () => {})",
    "'portfolio'.slice(1)",
    "import { Sector } from 'recharts'; const element = <Sector />; void element",
    "import { QueryClient } from '@tanstack/react-query'; new QueryClient().query({ queryKey: ['positions'], queryFn: async () => [], staleTime: 'static' })",
    "const custom = { substr: () => 'supported' }; custom.substr()",
  ])('accepts supported resolved APIs: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })

  it.each([
    'src/shared/helpers/presenters/getErrorMessage.ts',
    'src/shared/helpers/presenters/getErrorMessage.test.ts',
    'vite.config.ts',
    'vitest.config.ts',
  ])('checks deprecated methods in %s', async (filename) => {
    const messages = await lint("'portfolio'.substr(1)", filename)
    expect(messages).toHaveLength(1)
    expect(messages[0].ruleId).toBe('@typescript-eslint/no-deprecated')
  })
})
