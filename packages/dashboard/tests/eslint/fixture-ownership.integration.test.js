import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })
const file =
  'src/domains/portfolio/shared/helpers/transformers/resolveFilteredHistoryState.test.ts'
const code = `import type {PortfolioHistoryPoint as Point} from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type';
export function sample(overrides: Partial<Point> = {}): Point {return {date: new Date('2026-01-31'), total_value: 100, total_cost_basis: 80, unrealized_gain: 20, net_cash_injected: 80, cash_delta: null, tri: null, tri_rolling_1y: null, tri_rolling_3y: null, ...overrides}}`

beforeAll(async () => {
  await eslint.lintText('', { filePath: resolve(directory, file) })
}, 20_000)
async function diagnostics(source, path = file) {
  const [result] = await eslint.lintText(source, {
    filePath: resolve(directory, path),
  })
  return result.messages
    .filter(
      (message) =>
        message.fatal || message.ruleId === 'local/test-fixture-contract',
    )
    .map((message) => ({ id: message.messageId, severity: message.severity }))
}

describe('configured fixture ownership protection', () => {
  it('rejects the missed local factory at error level with an aliased real entity', async () => {
    expect(await diagnostics(code)).toEqual([{ id: 'factory', severity: 2 }])
  })
  it('accepts the same factory in its owning mocks folder', async () => {
    expect(
      await diagnostics(
        code,
        'src/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock.ts',
      ),
    ).toEqual([])
  })
  it('accepts a test using the existing fixture with a scenario override', async () => {
    expect(
      await diagnostics(
        "import {makePortfolioHistoryPoint} from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'; const sample = makePortfolioHistoryPoint({total_value: 250})",
      ),
    ).toEqual([])
  })
})
