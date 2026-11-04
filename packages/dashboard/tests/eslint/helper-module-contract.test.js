import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })
const filePath = resolve(
  directory,
  'src/domains/portfolio/shared/components/AllocationCategory/helpers/presenters/getAllocationTone.ts',
)

beforeAll(async () => {
  await eslint.lintText('', { filePath })
}, 20_000)

async function lint(code) {
  const [result] = await eslint.lintText(code, { filePath })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/helper-module-contract',
  )
}

describe('configured helper module contract', () => {
  it.each([
    'export function getTone(rows: number[]) {return rows}',
    'function latest(rows: number[]) {return rows}; export {latest as getTone}',
  ])(
    'rejects mismatched helper names through the application preset: %s',
    async (code) => {
      expect(await lint(code)).toMatchObject([
        { messageId: 'name', severity: 2 },
      ])
    },
  )

  it.each([
    'export function getAllocationTone(rows: number[]) {return rows}',
    'function latest(rows: number[]) {return rows}; export {latest as getAllocationTone}',
  ])('preserves matching public helpers: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })
})
