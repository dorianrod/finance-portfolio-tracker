import { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import singlePublicExport from './single-public-export.js'

function lint(code) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.ts'],
      languageOptions: { parser: tseslint.parser },
      plugins: {
        local: { rules: { 'single-public-export': singlePublicExport } },
      },
      rules: { 'local/single-public-export': 'warn' },
    },
    { filename: 'module.ts' },
  )
}

describe('single-public-export', () => {
  it.each([
    `export function main() {}; function helper() {}`,
    `export const main = () => 1; const helper = () => 2`,
    `export default function Main() {}; function Private() {}`,
    `export type Props = {}; export interface Result {}; export const value = 1`,
    `type Props = {}; interface Result {}; export { Props, Result }; export const value = 1`,
    `import type { Props } from './types'; export { Props }; export const value = 1`,
    `import { type Props } from './types'; export { Props }; export const value = 1`,
    `export type { Props, Result } from './types'; export { value } from './value'`,
    `export { type Props, value } from './value'`,
    `export type * from './types'`,
    `export * as values from './values'`,
    `export { value as '*' } from './values'`,
    `const privateValue = 1; export {}`,
    `export class Item { method() {} }`,
    `export function main(first: number, second: number) { return first + second }`,
    `export function main(value: string): string; export function main(value: string) { return value }`,
  ])('allows one value and private or type-only declarations: %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it.each([
    `export function First() {}; export function Second() {}`,
    `export default function Main() {}; export const secondary = 1`,
    `export const first = 1, second = 2`,
    `const first = 1, second = 2; export { first, second }`,
    `const first = 1; export { first, first as second }`,
    `export { first, second } from './values'`,
    `export * as 'first' from './first'; export * as 'second' from './second'`,
    `export const { first, nested: { second } } = input`,
    `export const [first, ...second] = input`,
  ])('counts exported values rather than export statements: %s', (code) => {
    expect(
      lint(code).map(({ messageId, severity }) => ({ messageId, severity })),
    ).toEqual([{ messageId: 'multiple', severity: 1 }])
  })

  it('counts an overloaded function only once', () => {
    const code = `export function main(value: string): string;
      export function main(value: number): number;
      export function main(value: string | number) { return value }
      export const other = 1`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual(['multiple'])
  })

  it('reports wildcard exports without offering a file-splitting fix', () => {
    const messages = lint(`export * from './first'; export const value = 1`)
    expect(messages.map(({ messageId }) => messageId)).toEqual(['wildcard'])
    expect(messages[0].fix).toBeUndefined()
  })

  it('enables both rules as warnings only for production modules', async () => {
    const eslint = new ESLint()
    for (const filename of [
      'src/shared/ui/Example.view.tsx',
      'src/shared/helpers/example.ts',
    ]) {
      const config = await eslint.calculateConfigForFile(filename)
      expect(config.rules['local/single-public-export']).toEqual([1])
      expect(config.rules['local/public-api-first']).toEqual([1])
    }
    for (const filename of [
      'src/example.test.ts',
      'src/example.spec.tsx',
      'src/__tests__/example.ts',
      'src/example.stories.tsx',
      'src/shared/ui/storybook/example.tsx',
      'src/types.d.ts',
      'vite.config.ts',
    ]) {
      const config = await eslint.calculateConfigForFile(filename)
      expect(config.rules['local/single-public-export']).toBeUndefined()
      expect(config.rules['local/public-api-first']).toBeUndefined()
    }
  })
})
