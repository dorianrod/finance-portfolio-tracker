import { Linter } from 'eslint'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { format } from 'prettier'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import publicApiFirst from './public-api-first.js'

const linter = new Linter()
const config = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: {
    local: { rules: { 'public-api-first': publicApiFirst } },
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'local/public-api-first': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
const options = { filename: 'module.tsx' }

function fix(code) {
  return linter.verifyAndFix(code, config, options)
}

describe('public-api-first', () => {
  it.each([
    `export function main() { return helper() }; type Props = {}; const constant = 1; function helper() { return constant }`,
    `'use client'; import { helper } from './helper'; export const Main = () => helper(); type Props = {}`,
    `const value = 1; export { value }`,
    `export type Props = {}; export const value = 1`,
    `function privateHelper() {}`,
  ])(
    'accepts the public API first or a module without public callables: %s',
    (code) => {
      expect(linter.verify(code, config, options)).toEqual([])
    },
  )

  it.each([
    `type Props = {}; export class Boundary extends Component { render() { return null } }`,
    `interface Props {}; class Boundary {}; export { Boundary }`,
    `type Props = {}; const Boundary = class {}; export default Boundary`,
    `type Props = {}; const value = 1; function helper() { return value }; export function main() { return helper() }`,
    `interface Props {}; export default function Main() { return <div /> }`,
    `function helper() {}; export const main = () => helper()`,
    `type Props = {}; export const main = (() => 1) satisfies (() => number)`,
    `type Props = {}; export const Main = memo(() => <div />)`,
    `type Props = {}; export default React.memo(React.forwardRef((props, ref) => <div />))`,
    `type Props = {}; function main() { return 1 }; export { main }`,
    `type Props = {}; const Main = () => <div />; export default Main`,
  ])('moves the public declaration before private declarations: %s', (code) => {
    const result = fix(code)
    expect(result.fixed).toBe(true)
    expect(result.messages).toEqual([])
    expect(fix(result.output)).toMatchObject({
      fixed: false,
      output: result.output,
    })
  })

  it('preserves directives, headers, imports, JSDoc and trailing comments', () => {
    const code = `// File header
'use client'
import { helper } from './helper'

// Private props
type Props = {}

/** Public documentation */
export function Main() { return helper() } // Public trailing comment
`
    const result = fix(code)
    expect(result.messages).toEqual([])
    expect(result.output).toContain(
      `// File header\n'use client'\nimport { helper } from './helper'`,
    )
    expect(result.output).toContain(
      `/** Public documentation */\nexport function Main() { return helper() } // Public trailing comment\n\n// Private props\ntype Props = {}`,
    )
  })

  it('keeps a file header before the public declaration without imports', () => {
    const result = fix(
      '// File header\ntype Props = {}\nexport function Main() {}',
    )
    expect(
      result.output.startsWith('// File header\nexport function Main() {}'),
    ).toBe(true)
  })

  it('moves an overload group as a unit', () => {
    const result = fix(`const factor = 2;
export function main(value: string): string;
export function main(value: number): number;
export function main(value: string | number) { return value }
`)
    expect(result.messages).toEqual([])
    expect(result.output.indexOf('const factor')).toBeGreaterThan(
      result.output.indexOf('return value'),
    )
    expect((result.output.match(/export function main/gu) ?? []).length).toBe(3)
  })

  it.each([
    `const Base = initialize(); export class Boundary extends Base {}`,
    `const initial = initialize(); export default class Boundary { static value = initial }`,
    `const seed = 1; export const main = () => seed`,
    `const Base = () => <div />; export const Main = memo(Base)`,
    `record('first'); export const Main = memo(() => <div />)`,
    `callMain(); export const main = function () {}`,
    `type Props = {}; export const main = () => 1, other = initialize()`,
    `const value = 1; // eslint-disable-next-line other-rule\nexport function main() {}`,
  ])(
    'reports without moving when initialization or suppression may change: %s',
    (code) => {
      const messages = linter
        .verify(code, config, options)
        .filter(({ ruleId }) => ruleId === 'local/public-api-first')
      expect(messages).toHaveLength(1)
      expect(messages[0].fix).toBeUndefined()
    },
  )

  it('preserves runtime behavior and the relative order of private initializations', () => {
    const code = `const events = [];
events.push('first');
const value = 3;
function helper() { return value * 2 }
events.push('second');
export function main() { return helper() }
events.push(main());`
    const result = fix(code)
    const evaluate = (source) =>
      new Function(`${source.replace('export ', '')}; return events;`)()
    expect(evaluate(result.output)).toEqual(evaluate(code))
    expect(evaluate(result.output)).toEqual(['first', 'second', 6])
  })

  it('converges with Prettier and import/export sorting on legacy multi-export files', async () => {
    const code = `import { z } from './z'; import { a } from './a';
type Props = {};
export function First() { return a() }
function helper() {}
export function Second() { return z() }`
    const result = fix(code)
    expect(result.messages).toEqual([])
    const formatted = await format(result.output, {
      parser: 'typescript',
      semi: false,
      singleQuote: true,
    })
    expect(fix(formatted)).toMatchObject({
      fixed: false,
      output: formatted,
      messages: [],
    })
    expect(formatted.indexOf('export function Second')).toBeLessThan(
      formatted.indexOf('type Props'),
    )
  })
})
