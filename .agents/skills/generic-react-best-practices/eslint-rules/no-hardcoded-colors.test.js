import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import rule from './no-hardcoded-colors.js'

function lint(code, filename = 'src/app/services/useTheme.tsx') {
  return new Linter().verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { local: { rules: { color: rule } } },
      rules: { 'local/color': 'error' },
    },
    { filename },
  )
}

describe('semantic colors including DOM writes', () => {
  it.each([
    `const meta = document.querySelector('meta[name="theme-color"]'); meta?.setAttribute('content', '#111827')`,
    `const meta = document.querySelector('meta[name="theme-color"]'); meta?.setAttribute('content', '#111827')`,
    `document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#111827')`,
    `document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111827' : '#f9fafb')`,
    `const accent = '#abcdef'; element.style.color = accent`,
    `element.style.setProperty('background-color', 'rgb(0, 0, 0)')`,
    `element.setAttribute('fill', '#fff')`,
    `<button style={{ color: 'red' }} />`,
    `<button className="bg-red-500" />`,
  ])('rejects literal appearance values: %s', (code) =>
    expect(lint(code).length).toBeGreaterThan(0),
  )
  it.each([
    `document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_THEME_COLORS[theme])`,
    `<button className="bg-positive text-content" />`,
    `const anchor = '#abc'; element.setAttribute('href', anchor)`,
    `element.style.color = 'var(--color-positive)'`,
    `const geometry = { width: 10, overflow: 'visible' }`,
  ])('allows semantic tokens and unrelated strings: %s', (code) =>
    expect(lint(code)).toEqual([]),
  )
  it('allows dedicated token definitions', () =>
    expect(
      lint(
        `export const colors = { color: '#111827' }`,
        'src/shared/theme/colors.ts',
      ),
    ).toEqual([]))
  it('checks shared UI implementations too', () =>
    expect(
      lint(`<span className="text-blue-500" />`, 'src/shared/ui/Text.view.tsx'),
    ).toHaveLength(1))
})
