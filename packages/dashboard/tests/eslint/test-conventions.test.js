import { resolve } from 'node:path'

import noConditionalTestAssertions from '@frontend-engineering/react-best-practices/rules/no-conditional-test-assertions.js'
import noServicePresentation from '@frontend-engineering/react-best-practices/rules/no-service-presentation.js'
import noTestStyleAssertions from '@frontend-engineering/react-best-practices/rules/no-test-style-assertions.js'
import preferSemanticTestQueries from '@frontend-engineering/react-best-practices/rules/prefer-semantic-test-queries.js'
import testFixtureContract from '@frontend-engineering/react-best-practices/rules/test-fixture-contract.js'
import { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const implementations = {
  'no-conditional-test-assertions': noConditionalTestAssertions,
  'no-service-presentation': noServicePresentation,
  'no-test-style-assertions': noTestStyleAssertions,
  'prefer-semantic-test-queries': preferSemanticTestQueries,
  'test-fixture-contract': testFixtureContract,
}

function lint(rule, code, filename = 'Example.test.tsx') {
  return new Linter({ cwd: '/project' })
    .verify(
      code,
      {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
          parser: tseslint.parser,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { local: { rules: implementations } },
        rules: { [`local/${rule}`]: 'error' },
      },
      { filename },
    )
    .map(({ messageId, message, fatal }) => messageId ?? { message, fatal })
}

describe('test style assertions', () => {
  const imports = `import {screen as ui} from '@testing-library/react'; import {expect as check} from 'vitest'; import {renderToStaticMarkup as markup} from 'react-dom/server'; const button = ui.getByRole('button'); const html = markup(<button className="px-3 bg-accent">Save</button>);`
  it.each([
    `check(button).toHaveClass('px-3')`,
    `check(button).not.toHaveClass('bg-accent')`,
    `check.soft(button).toHaveClass('px-3')`,
    `const matcher = check(button).toHaveClass; matcher('px-3')`,
    `check(button).toHaveAttribute('class', 'px-3')`,
    `check(button.className).toContain('px-3')`,
    `check(button['className']).toBe('px-3')`,
    `check(button.classList.contains('px-3')).toBe(true)`,
    `check(button.getAttribute('class')).toMatch(/px-3/)`,
    `const classes = button.className; check(classes).toBe('px-3')`,
    `const {className: classes} = button; check(classes).toContain('px-3')`,
    `check(html).toContain('px-3 py-2')`,
    `check(html).toContain('hover:bg-surface')`,
    `const expected = 'rounded-' + 'full'; check(html).toContain(expected)`,
    'check(html).toContain(`font-semibold`)',
    `check(html).toMatch(/class="[^"]*truncate/)`,
    `check(html.includes('text-warning')).toBe(true)`,
    `check(button.outerHTML).toContain('bg-accent')`,
    'check(html).toContain(`class="${name}"`)',
    `it.each([{style: 'bg-accent'}, {style: 'bg-warning'}])('case', ({style}) => check(html).toContain(style))`,
    `it.each(['px-3', 'px-4'])('case', utility => check(html).toContain(utility))`,
    `it.each([['a', 'rounded-full']])('case', (name, utility) => check(html).toContain(utility))`,
  ])('rejects style coupling: %s', (code) => {
    expect(lint('no-test-style-assertions', `${imports}${code}`)).toEqual([
      'style',
    ])
  })
  it.each([
    `check(button).toHaveAttribute('aria-pressed', 'true')`,
    `check(button.textContent).toBe('Save')`,
    `check(html).toContain('Save')`,
    `check(html).toContain('aria-hidden="true"')`,
    `check(html).toContain('fill="#123456"')`,
    `check(html).toContain('border-top:1px solid var(--tooltip-border)')`,
    `check(html).toContain('text-align:right')`,
    `check(html).toContain('The text-warning is a documented example')`,
    `check(html).toContain('[pending')`,
    `check('px-3').toBe('px-3')`,
    `check({ className: 'business-data' }.className).toBe('business-data')`,
    `function example(check) { check(button.className).toBe('px-3') }`,
    `const builder = {each: table => (title, callback) => callback({style: 'data'})}; builder.each([{style: 'bg-warning'}])('case', ({style}) => check(html).toContain(style))`,
  ])(
    'allows semantic state, data, public SVG output and shadowed APIs: %s',
    (code) => {
      expect(lint('no-test-style-assertions', `${imports}${code}`)).toEqual([])
    },
  )
  it('does not apply to production code', () => {
    expect(
      lint(
        'no-test-style-assertions',
        `${imports}check(button).toHaveClass('px-3')`,
        'Example.tsx',
      ),
    ).toEqual([])
  })
})

describe('unconditional test assertions', () => {
  it.each([
    `if (ready) expect(value).toBe(1)`,
    `if (ready) expect.soft(value).toBe(1)`,
    `const check = expect; if (ready) check(value).toBe(1)`,
    `if (ready) {} else expect(value).toBe(1)`,
    `ready ? expect(value).toBe(1) : null`,
    `ready && expect(value).toBe(1)`,
    `ready || expect(value).toBe(1)`,
    `ready ?? expect(value).toBe(1)`,
    `for (const value of values) expect(value).toBe(1)`,
    `for (const key in values) expect(key).toBe('a')`,
    `for (let i = 0; i < 2; i++) expect(i).toBe(1)`,
    `while (ready) expect(value).toBe(1)`,
    `do { expect(value).toBe(1) } while (ready)`,
    `values.forEach(value => expect(value).toBe(1))`,
    `values.map(value => expect(value).toBe(1))`,
    `values.every(value => expect(value).toBe(1))`,
    `switch (value) { case 1: expect(value).toBe(1) }`,
    `try { run() } catch { expect(value).toBe(1) }`,
    `import {expect as check} from 'vitest'; if (ready) check(value).toBe(1)`,
    `import * as suite from '@jest/globals'; if (ready) suite.expect(value).toBe(1)`,
  ])('rejects a skippable or repeated assertion: %s', (code) => {
    expect(lint('no-conditional-test-assertions', code)).toEqual([
      'conditional',
    ])
  })
  it.each([
    `it.each([1, 2])('handles %s', value => expect(value).toBeGreaterThan(0))`,
    `expect(values.map(value => value.id)).toEqual(['a', 'b'])`,
    `await waitFor(() => expect(value).toBe(1))`,
    `if (ready) run(); expect(value).toBe(1)`,
    `const expected = ready ? 1 : 2; expect(value).toBe(expected)`,
    `function example(expect) { if (ready) expect(value) }`,
    `expect(value).toBe(1)`,
  ])(
    'allows parametrization, polling and unconditional result assertions: %s',
    (code) => {
      expect(lint('no-conditional-test-assertions', code)).toEqual([])
    },
  )
})

describe('semantic test queries', () => {
  it.each([
    `import {screen as ui} from '@testing-library/react'; ui.getByTestId('save')`,
    `import {getByTestId as lookup} from '@testing-library/dom'; lookup(document.body, 'save')`,
    `import * as rtl from '@testing-library/react'; rtl.screen['queryAllByTestId']('save')`,
    `import {render} from '@testing-library/react'; const {getByTestId: lookup} = render(<button/>); lookup('save')`,
    `import {within} from '@testing-library/react'; within(document.body).findByTestId('save')`,
    `document.querySelector('button')`,
    `document.body.querySelectorAll('button')`,
    `import {render} from '@testing-library/react'; const {container} = render(<button/>); container.querySelector('.button')`,
    `import {screen} from '@testing-library/react'; screen.getByRole('button').closest('div')`,
  ])('rejects non-semantic queries: %s', (code) => {
    expect(lint('prefer-semantic-test-queries', code)).toEqual(['query'])
  })
  it.each([
    `import {fireEvent as fire} from '@testing-library/react'; fire.click(button)`,
    `import * as rtl from '@testing-library/react'; rtl.fireEvent.change(input)`,
    `import {fireEvent} from '@testing-library/dom'; fireEvent(button, event)`,
  ])('rejects synthetic interactions: %s', (code) => {
    expect(lint('prefer-semantic-test-queries', code)).toEqual(['event'])
  })
  it('rejects DOM tagName checks', () => {
    expect(
      lint(
        'prefer-semantic-test-queries',
        `import {screen} from '@testing-library/react'; expect(screen.getByRole('button').tagName).toBe('BUTTON')`,
      ),
    ).toEqual(['tag'])
  })
  it.each([
    `import {screen} from '@testing-library/react'; screen.getByRole('button', {name: 'Save'})`,
    `import {within} from '@testing-library/react'; within(document.body).getByText('Details')`,
    `import userEvent from '@testing-library/user-event'; await userEvent.setup().click(button)`,
    `const node = compilerNode; node.tagName.getText(source)`,
    `const parser = {querySelector() {}}; parser.querySelector('syntax')`,
    `import {getByTestId} from 'other'; getByTestId('business-id')`,
    `import {screen} from '@testing-library/react'; function run(screen) {screen.getByTestId('id')}`,
  ])('allows semantic queries and unrelated APIs: %s', (code) => {
    expect(lint('prefer-semantic-test-queries', code)).toEqual([])
  })
})

describe('deterministic mock data', () => {
  it.each(['new Date()', 'Date()', 'Date.now()', 'Math.random()'])(
    'rejects live input in a fixture: %s',
    (code) => {
      expect(
        lint(
          'test-fixture-contract',
          `export const value = ${code}`,
          'src/mocks/entity.mock.ts',
        ),
      ).toEqual(['clock'])
    },
  )
  it.each([
    `const Clock = Date; new Clock()`,
    `const now = Date.now; now()`,
    `const random = Math.random; random()`,
  ])('follows immutable clock and random aliases: %s', (code) => {
    expect(
      lint('test-fixture-contract', code, 'src/mocks/entity.mock.ts'),
    ).toEqual(['clock'])
  })
  it.each([
    `new Date('2026-01-15T00:00:00Z')`,
    `new Date(0)`,
    `const Date = {now: () => 1}; Date.now()`,
    `const Math = {random: () => 0.5}; Math.random()`,
  ])('allows fixed inputs and shadowed functions: %s', (code) => {
    expect(
      lint('test-fixture-contract', code, 'src/mocks/entity.mock.ts'),
    ).toEqual([])
  })
  it('allows clock assertions in a test with its own fake clock', () => {
    expect(
      lint(
        'test-fixture-contract',
        'vi.setSystemTime(0); expect(Date.now()).toBe(0)',
      ),
    ).toEqual([])
  })
})

describe('domain service presentation boundaries', () => {
  const filename =
    '/project/src/domains/sales/features/analytics/services/useSummary.ts'
  it.each([
    `import {useTranslation} from 'react-i18next'`,
    `import * as translation from 'i18next'`,
    `import i18n from '@/i18n/i18n'`,
    `import {useFormatMoney} from '@/shared/helpers/formatters/useFormatMoney'`,
    `export {useTranslation} from 'react-i18next'`,
    `export * from 'i18next'`,
    `const translation = import('react-i18next')`,
  ])('keeps display dependencies out of reusable services: %s', (code) => {
    expect(lint('no-service-presentation', code, filename)).toEqual([
      'presentation',
    ])
  })
  it.each([
    `import type {TFunction} from 'i18next'`,
    `import {type TFunction} from 'i18next'`,
    `export type {TFunction} from 'i18next'`,
    `import {summarize} from '@/domains/sales/shared/helpers/calculators/summarize'`,
  ])('allows type-only dependencies and business calculations: %s', (code) => {
    expect(lint('no-service-presentation', code, filename)).toEqual([])
  })
  it.each([
    '/project/src/domains/sales/features/analytics/components/Summary/services/useSummary.ts',
    '/project/src/domains/sales/features/analytics/pages/summary/services/useSummary.ts',
    '/project/src/shared/ui/services/useSummary.ts',
    '/project/src/app/services/useSummary.ts',
    '/project/src/domains/sales/features/analytics/services/useSummary.test.ts',
  ])('allows presentation at its owning boundary: %s', (file) => {
    expect(
      lint(
        'no-service-presentation',
        `import {useTranslation} from 'react-i18next'`,
        file,
      ),
    ).toEqual([])
  })
})

describe('pure calculation presentation boundaries', () => {
  const filename =
    '/project/src/domains/sales/features/analytics/components/Summary/helpers/calculators/computeReturns.ts'
  it.each([
    `import translated from '@/i18n/i18n'; export const label = translated.t('returns')`,
    `export {useTranslation as useLabels} from 'react-i18next'`,
    `const labels = import('@/shared/helpers/formatters/useFormatMoney')`,
  ])('rejects presentation inside component-owned calculations: %s', (code) => {
    expect(lint('no-service-presentation', code, filename)).toEqual([
      'presentation',
    ])
  })
  it.each([
    `import type {TFunction} from 'i18next'`,
    `export const computeReturn = (current: number, reference: number) => current / reference - 1`,
  ])('preserves type dependencies and numeric results: %s', (code) => {
    expect(lint('no-service-presentation', code, filename)).toEqual([])
  })
})

describe('typed fixture casts and actual configuration', () => {
  const directory = resolve(import.meta.dirname, '../..')
  const eslint = new ESLint({ cwd: directory })
  // Initialize the typed project once, outside the per-case timeout.
  beforeAll(async () => {
    await eslint.lintText('', {
      filePath: resolve(
        directory,
        'src/domains/portfolio/shared/helpers/mappers/resolveFilteredHistoryState.test.ts',
      ),
    })
  }, 20_000)
  async function configured(
    rule,
    code,
    filename = 'src/domains/portfolio/shared/helpers/mappers/resolveFilteredHistoryState.test.ts',
  ) {
    const [result] = await eslint.lintText(code, {
      filePath: resolve(directory, filename),
    })
    return result.messages
      .filter((message) => message.fatal || message.ruleId === `local/${rule}`)
      .map(({ messageId, message }) => messageId ?? message)
  }
  it.each([
    `{id: 'a'} as Entity`,
    `<Entity>{id: 'a'}`,
    `{id: 'a'} as unknown as Entity`,
    `[{id: 'a'}] as Entity[]`,
    `raw as Entity`,
  ])('rejects incomplete entity fixtures: %s', async (expression) => {
    expect(
      await configured(
        'test-fixture-contract',
        `type Entity = {id: string; name: string}; const raw = {id: 'a'}; const fixture = ${expression}`,
      ),
    ).toEqual(['cast'])
  })
  it.each([
    `const fixture: Entity = {id: 'a', name: 'A'}`,
    `const fixture = {id: 'a', name: 'A'} satisfies Entity`,
    `const fixture = {id: 'a'} as const`,
    `const fixture = {id: 'a'} as Partial<Entity>`,
    `const fixture = {id: 'a', name: 'A'} as Entity`,
    `const fixture = document.activeElement as HTMLInputElement`,
  ])(
    'allows complete fixtures, explicit partials and DOM narrowing: %s',
    async (declaration) => {
      expect(
        await configured(
          'test-fixture-contract',
          `type Entity = {id: string; name: string}; ${declaration}`,
        ),
      ).toEqual([])
    },
  )
  it('registers style assertions at error severity', async () => {
    expect(
      await configured(
        'no-test-style-assertions',
        `import {expect} from 'vitest'; import {screen} from '@testing-library/react'; expect(screen.getByRole('button')).toHaveClass('px-3')`,
      ),
    ).toEqual(['style'])
  })
  it('registers conditional assertions at error severity', async () => {
    expect(
      await configured(
        'no-conditional-test-assertions',
        `import {expect} from 'vitest'; if (ready) expect(value).toBe(1)`,
      ),
    ).toEqual(['conditional'])
  })
  it('resolves DOM receivers supplied through helper return types', async () => {
    expect(
      await configured(
        'prefer-semantic-test-queries',
        `function element(): HTMLDivElement {return document.createElement('div')}; element().querySelector('.item')`,
      ),
    ).toEqual(['query'])
  })
  it('keeps compiler AST tagName access outside DOM enforcement', async () => {
    expect(
      await configured(
        'prefer-semantic-test-queries',
        `import ts from 'typescript'; function visit(node: ts.JsxOpeningElement) {return node.tagName.getText()}`,
      ),
    ).toEqual([])
  })
  it('registers reusable service presentation boundaries', async () => {
    expect(
      await configured(
        'no-service-presentation',
        `import i18n from '@/i18n/i18n'`,
        'src/domains/portfolio/shared/services/useDashboardHistory.ts',
      ),
    ).toEqual(['presentation'])
  })
  it('rejects calculator translations with the configured rule and severity', async () => {
    const filename = resolve(
      directory,
      'src/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/computeRollingReturns.ts',
    )
    const [invalid] = await eslint.lintText(
      `import translated from '@/i18n/i18n'`,
      { filePath: filename },
    )
    expect(
      invalid.messages.filter(
        (message) => message.ruleId === 'local/no-service-presentation',
      ),
    ).toMatchObject([
      {
        ruleId: 'local/no-service-presentation',
        messageId: 'presentation',
        severity: 2,
      },
    ])
    const [valid] = await eslint.lintText(
      `export const computeReturn = (current: number, reference: number) => current / reference - 1`,
      { filePath: filename },
    )
    expect(
      valid.messages.filter(
        (message) => message.ruleId === 'local/no-service-presentation',
      ),
    ).toEqual([])
  })
  it.each(Object.keys(implementations))(
    'enables %s at error severity',
    async (rule) => {
      const config = await eslint.calculateConfigForFile(
        resolve(directory, 'src/main.tsx'),
      )
      expect(config.rules[`local/${rule}`]).toEqual([2])
    },
  )
})
