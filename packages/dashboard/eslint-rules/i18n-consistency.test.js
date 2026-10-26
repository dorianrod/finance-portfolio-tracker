import { readFileSync } from 'node:fs'

import { Linter } from 'eslint'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import i18nConsistency from './i18n-consistency.js'

const catalog = vi.hoisted(() => ({
  'ui.accounttreeselect.allAccounts': 'All accounts',
  'ui.accounttreeselect.reset': 'Reset',
  'ui.accounttreeselect.selectAll': 'Select all',
  'ui.accounttreeselect.selected': 'Selected',
  greeting: 'Hello {{name}}',
  items_one: '{{count}} item',
  items_other: '{{count}} items',
}))

vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal()),
  readFileSync: vi.fn(() => JSON.stringify(catalog)),
}))

const linter = new Linter({ configType: 'flat' })

function lint(code) {
  return linter.verify(code, {
    plugins: {
      local: { rules: { 'i18n-consistency': i18nConsistency } },
    },
    rules: { 'local/i18n-consistency': 'error' },
  })
}

beforeEach(() => {
  vi.mocked(readFileSync).mockClear()
  vi.mocked(readFileSync).mockReturnValue(JSON.stringify(catalog))
})

describe('i18n-consistency', () => {
  it('does not read the catalog for modules without translation calls', () => {
    expect(lint('const value = 1; other.t(value)')).toEqual([])
    expect(readFileSync).not.toHaveBeenCalled()
  })

  it('reads the catalog only once for several translations in one file', () => {
    expect(
      lint(
        "i18n.t('greeting', { name: 'Alice' }); i18n.t('items', { count: 2 })",
      ),
    ).toEqual([])
    expect(readFileSync).toHaveBeenCalledTimes(1)
  })

  it.each([
    `i18n.t('ui.accounttreeselect.allAccounts')`,
    `i18n.t('ui.accounttreeselect.reset')`,
    `i18n.t('ui.accounttreeselect.selectAll')`,
    `i18n.t('ui.accounttreeselect.selected')`,
    `i18n.t('greeting', { name: user.name })`,
    `i18n.t('items', { count: items.length })`,
    `other.t('unknown')`,
  ])('accepts %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it.each([
    [`i18n.t('unknown')`, 'missingKey'],
    [`i18n.t(key)`, 'dynamicKey'],
    [`i18n.t()`, 'dynamicKey'],
    [`i18n.t('greeting')`, 'missingInterpolation'],
    [`i18n.t('greeting', { other: user.name })`, 'missingInterpolation'],
    [`i18n.t('items')`, 'missingInterpolation'],
    [`i18n.t('ui.accounttreeselect.reset', 'Reset')`, 'defaultValue'],
    [
      `i18n.t('ui.accounttreeselect.reset', { defaultValue: 'Reset' })`,
      'defaultValue',
    ],
  ])('rejects %s', (code, messageId) => {
    expect(lint(code).map((message) => message.messageId)).toEqual([messageId])
  })

  it('recognizes a key added after the rule module was loaded', () => {
    const code = `i18n.t('newKey')`
    expect(lint(code).map((message) => message.messageId)).toEqual([
      'missingKey',
    ])

    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ ...catalog, newKey: 'New translation' }),
    )

    expect(lint(code)).toEqual([])
  })

  it('recognizes a key removed between lint runs', () => {
    const code = `i18n.t('ui.accounttreeselect.reset')`
    expect(lint(code)).toEqual([])

    vi.mocked(readFileSync).mockReturnValue('{}')

    expect(lint(code).map((message) => message.messageId)).toEqual([
      'missingKey',
    ])
  })

  it('checks interpolation against the latest catalog contents', () => {
    const code = `i18n.t('greeting', { name: user.name })`
    expect(lint(code)).toEqual([])

    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ ...catalog, greeting: 'Hello {{name}} from {{city}}' }),
    )

    expect(lint(code)).toEqual([
      expect.objectContaining({
        messageId: 'missingInterpolation',
        message: 'Translation "greeting" requires interpolation option "city".',
      }),
    ])
  })
})
