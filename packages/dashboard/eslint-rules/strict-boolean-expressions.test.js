import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })

async function lint(code, file = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) =>
      message.fatal ||
      message.ruleId === '@typescript-eslint/strict-boolean-expressions',
  )
}

describe('configured numeric boolean checks', () => {
  it('detects nullable coordinate guards that discard zero', async () => {
    expect(
      await lint(
        'function position(cx?: number, cy?: number, angle?: number) { if (!cx || !cy || !angle) return null; return {cx,cy,angle} }',
      ),
    ).toMatchObject([
      { messageId: 'conditionErrorNullableNumber', severity: 2 },
      { messageId: 'conditionErrorNullableNumber', severity: 2 },
      { messageId: 'conditionErrorNullableNumber', severity: 2 },
    ])
  }, 20_000)

  it('accepts explicit missing-value, zero and collection-length policies', async () => {
    expect(
      await lint(
        'function position(value: number | null, rows: unknown[]) { if (value == null || value === 0 || rows.length === 0) return null; return value }',
      ),
    ).toEqual([])
  })

  it('does not impose production numeric conventions on test fixtures', async () => {
    expect(
      await lint(
        'function probe(value: number | null) { return value ? 1 : 0 }',
        'src/shared/helpers/formatters/useFormatMoney.test.tsx',
      ),
    ).toEqual([])
  })
})
