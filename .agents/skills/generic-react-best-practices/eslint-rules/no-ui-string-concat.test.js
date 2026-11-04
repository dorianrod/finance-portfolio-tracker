import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import rule from './no-ui-string-concat.js'

function lint(
  code,
  filename = 'src/domains/orders/helpers/presenters/buildLabel.tsx',
) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { local: { rules: { text: rule } } },
      rules: { 'local/text': 'error' },
    },
    { filename },
  )
}

describe('display interpolation', () => {
  it.each([
    'function range(from, to) { return `${from} – ${to}` }',
    "function text(name) { return i18n.t('hello') + ' ' + name }",
    "import i18n from '@/i18n/i18n'; const tr = i18n.t; function label(name) { return `${tr('hello')} ${name}` }",
    "import {useTranslation} from 'react-i18next'; function label(name) { const {t:tr}=useTranslation(); return `${tr('hello')} ${name}` }",
  ])('rejects assembled translated text and presentation ranges: %s', (code) =>
    expect(lint(code).map((message) => message.messageId)).toEqual([
      'interpolation',
    ]),
  )
  it.each([
    "function range(from, to) { return i18n.t('range', { from, to }) }",
    'function geometry(x) { return `translate(${x}, 0)` }',
    'function className(size) { return `text-${size}` }',
    'function Row({account, id}) { return <div key={`${account}-${id}`} /> }',
  ])('allows interpolation and technical strings: %s', (code) =>
    expect(lint(code)).toEqual([]),
  )
  it('detects numeric units in chart renderers', () =>
    expect(
      lint(
        'function Tick({value}) { return <text>{`${Math.round(value)}%`}</text> }',
        'src/domains/orders/components/Tick.view.tsx',
      ).map((message) => message.messageId),
    ).toEqual(['interpolation']))
  it('allows unit formatting inside the numeric formatter owner', () =>
    expect(
      lint(
        'function format(value) { return `${value}%` }',
        'src/shared/helpers/formatters/formatPercentage.ts',
      ),
    ).toEqual([]))
})
