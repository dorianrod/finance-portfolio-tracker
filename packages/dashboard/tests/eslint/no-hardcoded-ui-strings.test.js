import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })
const presenter =
  'src/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/helpers/presenters/withAccountTypeShares.ts'

async function lint(code, filename = presenter) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, filename),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-hardcoded-ui-strings',
  )
}

describe('copy versus technical identifiers through the application configuration', () => {
  it.each([
    ['return `Balance ${value}`', 1],
    ['return value > 0 ? `Available ${value}` : `Missing ${value}`', 2],
  ])(
    'rejects untranslated presenter copy: %s',
    async (body, count) => {
      const messages = await lint(
        `export function label(value: number) {${body}}`,
      )
      expect(messages).toMatchObject(
        Array.from({ length: count }, () => ({
          ruleId: 'local/no-hardcoded-ui-strings',
          messageId: 'hardcoded',
          severity: 2,
        })),
      )
    },
    30_000,
  )

  it.each([
    'return `__order_share_${value}`',
    'return `region-${value}`',
    'return `url(#gradient-${value})`',
  ])('preserves technical presenter identifiers: %s', async (body) => {
    expect(await lint(`export function key(value: number) {${body}}`)).toEqual(
      [],
    )
  })

  it('keeps explicit user-facing templates checked even when their words resemble an identifier', async () => {
    expect(
      await lint(
        'export function Label({value}: {value: number}) { return <span title={`order-${value}`} /> }',
        'src/app/App.feature.tsx',
      ),
    ).toMatchObject([{ messageId: 'hardcoded', severity: 2 }])
  })
  it('preserves source text in typed data fixtures while checking the same copy in product presenters', async () => {
    const code = "export const diagnostic = { message: 'Payment unavailable' }"
    expect(
      await lint(code, 'src/domains/portfolio/shared/mocks/position.mock.ts'),
    ).toEqual([])
    expect(await lint(code)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'local/no-hardcoded-ui-strings',
          messageId: 'hardcoded',
          severity: 2,
        }),
      ]),
    )
  })
})
