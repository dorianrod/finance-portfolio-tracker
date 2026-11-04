import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

import { formatLintCounts, summarizeLintResults } from './lint-counts.mjs'

const directories = []
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

describe('lint counts', () => {
  it('keeps suppressed diagnostics separate and counts each file once per rule', () => {
    const report = summarizeLintResults([
      {
        messages: [
          { ruleId: 'rule-a', severity: 2 },
          { ruleId: 'rule-a', severity: 2 },
          { ruleId: 'rule-b', severity: 1 },
          { ruleId: 'local/reviewed-eslint-suppression', severity: 1 },
        ],
        suppressedMessages: [
          { ruleId: 'rule-a', severity: 2 },
          { ruleId: 'rule-b', severity: 1 },
          { ruleId: 'rule-c', severity: 2 },
        ],
      },
      { messages: [{ ruleId: 'rule-a', severity: 1 }] },
      { messages: [] },
    ])
    expect(report).toMatchObject({
      filesLinted: 3,
      totals: {
        errors: 2,
        warnings: 3,
        suppressedErrors: 2,
        suppressedWarnings: 1,
      },
    })
    expect(report.rules.find(({ ruleId }) => ruleId === 'rule-a')).toEqual({
      ruleId: 'rule-a',
      errors: 2,
      warnings: 1,
      suppressedErrors: 1,
      suppressedWarnings: 0,
      files: 2,
    })
    expect(
      report.rules.find(({ ruleId }) => ruleId === 'rule-c'),
    ).toMatchObject({
      errors: 0,
      warnings: 0,
      suppressedErrors: 1,
      files: 1,
    })
  })

  it('retains diagnostics without a rule, including parsing errors', () => {
    const report = summarizeLintResults([
      { messages: [{ ruleId: null, severity: 2, fatal: true }] },
    ])
    expect(report.totals.errors).toBe(1)
    expect(report.rules[0]).toMatchObject({ ruleId: null, errors: 1 })
    expect(formatLintCounts(report)).toContain('(no rule)')
  })

  it('orders rows by active severity, suppressed count and rule name', () => {
    const report = summarizeLintResults([
      {
        messages: [
          { ruleId: 'z-warning', severity: 1 },
          { ruleId: 'b-error', severity: 2 },
          { ruleId: 'a-error', severity: 2 },
        ],
        suppressedMessages: [{ ruleId: 'suppressed', severity: 2 }],
      },
    ])
    expect(report.rules.map(({ ruleId }) => ruleId)).toEqual([
      'a-error',
      'b-error',
      'z-warning',
      'suppressed',
    ])
  })

  it('reports an empty scope without inventing diagnostics', () => {
    const report = summarizeLintResults([])
    expect(report.rules).toEqual([])
    expect(formatLintCounts(report)).toContain('0 files; 0 errors; 0 warnings')
  })
})

describe('lint counts CLI', () => {
  function run(code, args = [], rootOption = true) {
    const root = mkdtempSync(join(tmpdir(), 'lint counts-'))
    directories.push(root)
    writeFileSync(
      join(root, 'eslint.config.mjs'),
      "export default [{ linterOptions: { reportUnusedDisableDirectives: 'error' }, rules: { 'no-debugger': 'error', 'no-alert': 'warn' } }]\n",
    )
    const source = join(root, 'example.js')
    writeFileSync(source, code)
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('./lint-counts.mjs', import.meta.url)),
        ...(rootOption ? ['--root', root] : []),
        ...args,
        'example.js',
      ],
      { cwd: rootOption ? tmpdir() : root, encoding: 'utf8' },
    )
    expect(result.error).toBeUndefined()
    expect(readFileSync(source, 'utf8')).toBe(code)
    return result
  }

  it.each([true, false])(
    'uses the real project configuration with explicit root=%s',
    (rootOption) => {
      const result = run(
        "// eslint-disable-next-line no-debugger\ndebugger;\nalert('test');\n",
        ['--json'],
        rootOption,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toMatchObject({
        filesLinted: 1,
        totals: {
          errors: 0,
          warnings: 1,
          suppressedErrors: 1,
          suppressedWarnings: 0,
        },
      })
    },
  )

  it('prints the table and fails when active errors remain', () => {
    const result = run('debugger;\n')
    expect(result.status, result.stderr).toBe(1)
    expect(result.stdout).toContain('1 files; 1 errors; 0 warnings')
    expect(result.stdout).toContain('no-debugger')
    expect(result.stdout).toContain('Suppressed')
  })

  it('counts real parsing errors without a rule ID', () => {
    const result = run('const = ;\n', ['--json'])
    expect(result.status, result.stderr).toBe(1)
    expect(JSON.parse(result.stdout).rules).toContainEqual({
      ruleId: null,
      errors: 1,
      warnings: 0,
      suppressedErrors: 0,
      suppressedWarnings: 0,
      files: 1,
    })
  })

  it('rejects options that could change the measurement or mutate files', () => {
    const result = run('debugger;\n', ['--fix'])
    expect(result.status).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr).toContain('--fix')
  })
})
