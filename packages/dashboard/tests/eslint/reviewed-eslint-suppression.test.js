import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import suppressionProcessor from '@frontend-engineering/react-best-practices/rules/eslint-suppression-processor.js'
import requireReviewedSuppression from '@frontend-engineering/react-best-practices/rules/require-reviewed-eslint-suppression.js'
import reviewedSuppression from '@frontend-engineering/react-best-practices/rules/reviewed-eslint-suppression.js'
import { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { afterEach, describe, expect, it } from 'vitest'

const validationRule = 'local/require-reviewed-eslint-suppression'
const trackingRule = 'local/reviewed-eslint-suppression'
const config = {
  files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  processor: suppressionProcessor,
  plugins: {
    local: {
      rules: {
        'require-reviewed-eslint-suppression': requireReviewedSuppression,
        'reviewed-eslint-suppression': reviewedSuppression,
      },
    },
  },
  linterOptions: { reportUnusedDisableDirectives: 'error' },
  rules: {
    'no-debugger': 'error',
    'no-alert': 'error',
    [validationRule]: 'error',
    [trackingRule]: 'warn',
  },
}
const review =
  'reviewed: 2026-10-27; The integration requires a debugger hook during this protocol.'
const directories = []

function lint(code, filename = 'example.tsx') {
  const linter = new Linter()
  return {
    messages: linter.verify(code, config, { filename }),
    suppressed: linter.getSuppressedMessages(),
  }
}

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

describe('reviewed ESLint suppressions', () => {
  it.each([
    'no-debugger',
    'no-debugger -- The integration requires this hook.',
    'no-debugger -- reviewed: 2026-10-27',
    'no-debugger -- reviewed: 2026-10-27;',
    'no-debugger -- reviewed: 2026-10-27;   ',
    'no-debugger -- reviewed: 2026-1-27; Missing zero padding.',
    'no-debugger -- reviewed: 2026-02-29; Invalid leap day.',
    'no-debugger -- reviewed: 2026-04-31; Invalid month day.',
    'no-debugger -- reviewed: 2026-13-01; Invalid month.',
    'no-debugger -- reviewed: 2026-00-01; Invalid month.',
    'no-debugger -- reviewed: 2026-10-00; Invalid day.',
    'no-debugger -- reviewed: 2026-10-32; Invalid day.',
    'no-debugger -- reviewed: 1900-02-29; Invalid century leap day.',
  ])('rejects missing or invalid metadata: %s', (directive) => {
    const { messages } = lint(
      `// eslint-disable-next-line ${directive}\ndebugger;`,
    )
    expect(messages).toEqual([
      expect.objectContaining({ ruleId: validationRule, severity: 2, line: 1 }),
    ])
    expect(messages[0].fix).toBeUndefined()
  })

  it.each([
    '/* eslint-disable */\ndebugger;',
    `/* eslint-disable -- ${review} */\ndebugger;`,
    `/* eslint-disable no-debugger -- ${review} */\ndebugger;`,
    '// eslint-disable-next-line\ndebugger;',
    `// eslint-disable-next-line -- ${review}\ndebugger;`,
    'debugger; // eslint-disable-line',
    `debugger; // eslint-disable-line -- ${review}`,
    `// eslint-disable-next-line no-debugger, -- ${review}\ndebugger;`,
    `// eslint-disable-next-line no-debugger no-alert -- ${review}\ndebugger;`,
  ])('rejects unnamed rules and block or file scope: %s', (code) => {
    const { messages } = lint(code)
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: validationRule, severity: 2 }),
    )
    expect(messages.some(({ ruleId }) => ruleId === trackingRule)).toBe(false)
  })

  it.each([
    `// eslint-disable-next-line no-debugger -- ${review}\ndebugger;`,
    `/* eslint-disable-next-line no-debugger -- ${review} */\ndebugger;`,
    `debugger; // eslint-disable-line no-debugger -- ${review}`,
    `debugger; /* eslint-disable-line no-debugger -- ${review} */`,
  ])(
    'suppresses the original error and emits exactly one tracking warning: %s',
    (code) => {
      const { messages, suppressed } = lint(code)
      expect(messages).toEqual([
        expect.objectContaining({ ruleId: trackingRule, severity: 1 }),
      ])
      expect(messages[0].message).toContain('no-debugger')
      expect(messages[0].message).toContain(review)
      expect(messages[0].fix).toBeUndefined()
      expect(suppressed).toEqual([
        expect.objectContaining({ ruleId: 'no-debugger', severity: 2 }),
      ])
    },
  )

  it.each(['2024-02-29', '2000-02-29', '2026-12-31'])(
    'accepts valid calendar dates: %s',
    (date) => {
      const { messages } = lint(
        `// eslint-disable-next-line no-debugger -- reviewed: ${date}; A demonstrated dependency constraint.\ndebugger;`,
      )
      expect(messages).toEqual([
        expect.objectContaining({ ruleId: trackingRule, severity: 1 }),
      ])
      expect(messages[0].message).toContain(date)
    },
  )

  it('counts a directive once when it suppresses several rules and diagnostics', () => {
    const { messages, suppressed } = lint(
      `// eslint-disable-next-line no-debugger, no-alert -- ${review}\ndebugger; debugger; alert('test');`,
    )
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ ruleId: trackingRule, severity: 1 })
    expect(messages[0].message).toContain('no-debugger, no-alert')
    expect(suppressed).toHaveLength(3)
  })

  it('counts independent directives separately', () => {
    const { messages } = lint(
      `// eslint-disable-next-line no-debugger -- ${review}\ndebugger;\n// eslint-disable-next-line no-alert -- ${review}\nalert('test');`,
    )
    expect(messages).toHaveLength(2)
    expect(messages.every(({ ruleId }) => ruleId === trackingRule)).toBe(true)
  })

  it('updates the last review date without adding another warning', () => {
    const code = `// eslint-disable-next-line no-debugger -- ${review}\ndebugger;`
    const before = lint(code).messages
    const after = lint(code.replace('2026-10-27', '2026-10-28')).messages
    expect(before).toHaveLength(1)
    expect(after).toHaveLength(1)
    expect(after[0].message).toContain('2026-10-28')
  })

  it('checks JSX comment directives', () => {
    const { messages, suppressed } = lint(
      `const element = <div>\n{/* eslint-disable-next-line no-alert -- ${review} */}\n{alert('test')}\n</div>`,
    )
    expect(messages).toEqual([
      expect.objectContaining({ ruleId: trackingRule, severity: 1, line: 2 }),
    ])
    expect(suppressed).toEqual([
      expect.objectContaining({ ruleId: 'no-alert' }),
    ])
    const invalid = lint(
      'const element = <div>\n{/* eslint-disable-next-line no-alert */}\n{alert("test")}\n</div>',
    )
    expect(invalid.messages).toEqual([
      expect.objectContaining({ ruleId: validationRule, severity: 2 }),
    ])
  })

  it('ignores directive examples in strings, templates and explanatory comments', () => {
    expect(
      lint(
        `const example = '// eslint-disable-next-line no-debugger';\nconst template = \`/* eslint-disable */\`;\n// Examples may use eslint-disable-next-line as text.\n/* Document the eslint-disable format here. */`,
      ).messages,
    ).toEqual([])
  })

  it('rejects unused suppressions even when the metadata is valid', () => {
    const { messages } = lint(
      `// eslint-disable-next-line no-debugger -- ${review}\nconst value = 1;`,
    )
    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: null,
        severity: 2,
        message: expect.stringContaining('Unused eslint-disable directive'),
      }),
    )
  })

  it('rejects a partially unused multi-rule suppression', () => {
    const { messages } = lint(
      `// eslint-disable-next-line no-debugger, no-alert -- ${review}\ndebugger;`,
    )
    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: null,
        severity: 2,
        message: expect.stringContaining('no-alert'),
      }),
    )
    expect(
      messages.filter(({ ruleId }) => ruleId === trackingRule),
    ).toHaveLength(1)
  })

  it('preserves policy diagnostics under blanket and explicitly targeted disables', () => {
    const { messages } = lint(
      `/* eslint-disable */\n// eslint-disable-next-line no-debugger -- ${review}\ndebugger;`,
    )
    expect(
      messages.filter(({ ruleId }) =>
        [validationRule, trackingRule].includes(ruleId),
      ),
    ).toHaveLength(2)
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: validationRule, severity: 2 }),
    )
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: trackingRule, severity: 1 }),
    )
    const targeted = lint(
      `debugger; // eslint-disable-line no-debugger, ${trackingRule} -- ${review}`,
    )
    expect(targeted.messages).toEqual([
      expect.objectContaining({ ruleId: trackingRule, severity: 1 }),
    ])
  })

  it('does not approve or date an exception during autofix', () => {
    const linter = new Linter()
    const code =
      '// eslint-disable-next-line no-debugger -- A dependency constraint.\ndebugger;'
    const result = linter.verifyAndFix(code, config, { filename: 'example.ts' })
    expect(result).toMatchObject({ fixed: false, output: code })
    expect(result.messages).toEqual([
      expect.objectContaining({ ruleId: validationRule, severity: 2 }),
    ])
  })

  it('preserves normal ESLint autofixes through the processor', () => {
    const linter = new Linter()
    const result = linter.verifyAndFix(
      'var value = 1;',
      { ...config, rules: { ...config.rules, 'no-var': 'error' } },
      { filename: 'example.js' },
    )
    expect(result).toMatchObject({
      fixed: true,
      output: 'let value = 1;',
      messages: [],
    })
  })

  it.each(['js', 'mjs', 'cjs', 'ts', 'tsx'])(
    'enables both rules and unused suppression errors in project .%s files',
    async (extension) => {
      const eslint = new ESLint({ cwd: resolve(import.meta.dirname, '../..') })
      const projectConfig = await eslint.calculateConfigForFile(
        `eslint-rules/example.${extension}`,
      )
      expect(projectConfig.rules[validationRule]).toEqual([2])
      expect(projectConfig.rules[trackingRule]).toEqual([1])
      expect(projectConfig.linterOptions.reportUnusedDisableDirectives).toBe(2)
      expect(projectConfig.processor).toMatchObject({
        meta: { name: 'reviewed-eslint-suppressions' },
        supportsAutofix: true,
      })
    },
  )
})

describe('ESLint warning ceiling', () => {
  function fixture() {
    const directory = mkdtempSync(
      join(tmpdir(), 'reviewed-eslint-suppression-'),
    )
    directories.push(directory)
    const projectConfig = pathToFileURL(
      resolve(import.meta.dirname, '../../eslint.config.js'),
    ).href
    const configFile = join(directory, 'eslint.config.mjs')
    writeFileSync(
      configFile,
      `import config from ${JSON.stringify(projectConfig)};\nexport default [...config, { rules: { 'no-debugger': 'error' } }];\n`,
    )
    const source = join(directory, 'example.js')
    const code = `// eslint-disable-next-line no-debugger -- ${review}\ndebugger;\n`
    writeFileSync(source, code)
    return { directory, configFile, source, code }
  }

  it.each([
    [0, 1],
    [1, 0],
  ])('with ceiling %s exits with status %s', (ceiling, expectedStatus) => {
    const example = fixture()
    const result = spawnSync(
      process.execPath,
      [
        resolve(import.meta.dirname, '../../node_modules/eslint/bin/eslint.js'),
        '--config',
        example.configFile,
        '--max-warnings',
        String(ceiling),
        '--format',
        'json',
        '--fix',
        example.source,
      ],
      { cwd: example.directory, encoding: 'utf8' },
    )
    expect(result.error).toBeUndefined()
    expect(result.status, result.stderr).toBe(expectedStatus)
    const [output] = JSON.parse(result.stdout)
    expect(output).toMatchObject({ errorCount: 0, warningCount: 1 })
    expect(output.messages).toEqual([
      expect.objectContaining({ ruleId: trackingRule, severity: 1 }),
    ])
    expect(readFileSync(example.source, 'utf8')).toBe(example.code)
  })
})
