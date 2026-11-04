import { resolve } from 'node:path'

import { ESLint, Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardDirectory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: dashboardDirectory })
const linter = new Linter()
const complexityRules = new Set(['complexity', 'max-lines-per-function'])

async function lint(code, filename = 'src/main.tsx') {
  const config = await eslint.calculateConfigForFile(
    resolve(dashboardDirectory, filename),
  )
  // These syntax-only rules need the effective file configuration, not a
  // TypeScript project or the dashboard's unrelated typed lint checks.
  return linter.verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: { parser: config.languageOptions.parser },
      rules: Object.fromEntries(
        [...complexityRules].map((rule) => [rule, config.rules[rule] ?? 'off']),
      ),
    },
    { filename },
  )
}

const longComponent = `function Workspace() {
  return <div>
    ${'<section />\n'.repeat(151)}
  </div>
}`

describe('configured component complexity checks', () => {
  it('detects a large JSX component with few hooks and branches', async () => {
    expect(await lint(longComponent)).toMatchObject([
      { ruleId: 'max-lines-per-function', severity: 2 },
    ])
  })

  it('detects branching independently of function size', async () => {
    const code = `function Workspace({ visible }) {
      ${'if (visible) refresh();'.repeat(8)}
      return <div />
    }`
    expect(await lint(code)).toMatchObject([
      { ruleId: 'complexity', severity: 2 },
    ])
  })

  it('allows a cohesive component at the branching limit', async () => {
    const code = `function Workspace({ visible }) {
      ${'if (visible) refresh();'.repeat(7)}
      return <div />
    }`
    expect(await lint(code)).toEqual([])
  })

  it('ignores blank and comment-only lines', async () => {
    const code = `function Workspace() {
      ${'\n// Explain a display decision\n'.repeat(151)}
      return <div />
    }`
    expect(await lint(code)).toEqual([])
  })

  it('checks branches inside memo callbacks independently', async () => {
    const code = `function Workspace({ visible }) {
      const action = useMemo(() => {
        ${'if (visible) refresh();'.repeat(8)}
        return null
      }, [visible])
      return <div>{action}</div>
    }`
    expect(await lint(code)).toMatchObject([
      { ruleId: 'complexity', severity: 2 },
    ])
  })

  it.each([
    'src/shared/ui/SidePanel.view.test.tsx',
    'src/shared/ui/storybook/stories/Metric.stories.tsx',
  ])('excludes test and story orchestration in %s', async (filename) => {
    expect(await lint(longComponent, filename)).toEqual([])
  })
})
