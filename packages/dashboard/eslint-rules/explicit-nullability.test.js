import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })
const entityFile = 'src/domains/portfolio/shared/types/positionRow.type.ts'

async function lint(code, filename = entityFile) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, filename),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/explicit-nullability',
  )
}

describe('explicit domain nullability through the application configuration', () => {
  it.each(['Date | null', 'null | string', 'number[] | null | undefined'])(
    'rejects an optional nullable %s property',
    async (type) => {
      expect(
        await lint(`export type Order = { delivery?: ${type} }`),
      ).toMatchObject([
        {
          ruleId: 'local/explicit-nullability',
          messageId: 'optionalNullable',
          severity: 2,
        },
      ])
    },
    30_000,
  )

  it.each([
    'export type Order = { delivery?: Date }',
    'export type Order = { delivery: Date | null }',
    'export type Order = { estimates?: Array<number | null> }',
    'export type Order = { load?: () => Date | null }',
  ])('allows a distinct absence contract: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })

  it('leaves external module augmentation under its dependency contract', async () => {
    expect(
      await lint(
        "declare module 'external' { interface Metadata { date?: Date | null } }",
      ),
    ).toEqual([])
  })

  it('leaves deliberately invalid test fixtures outside production checks', async () => {
    expect(
      await lint(
        'type Order = { delivery?: Date | null }',
        'src/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy/buildPositionRows.test.ts',
      ),
    ).toEqual([])
  })
})
