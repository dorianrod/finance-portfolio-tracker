import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, it } from 'vitest'

it('inventories the actual dashboard while keeping owned samples out of candidates', () => {
  const root = resolve(import.meta.dirname, '../..')
  const executable = fileURLToPath(
    import.meta
      .resolve('@frontend-engineering/react-best-practices/scripts/fixture-candidates.mjs'),
  )
  const result = spawnSync(process.execPath, [executable, '--root', root], {
    encoding: 'utf8',
  })
  expect(result.status, result.stderr).toBe(0)
  const inventory = JSON.parse(result.stdout)
  const scopeTest =
    'src/domains/portfolio/features/diversification/shared/helpers/transformers/prepareDiversificationScope.test.ts'
  const crosshairTest =
    'src/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair.test.ts'
  expect(inventory.source).toBe('src')
  expect(inventory.project).toBe('tsconfig.app.json')
  expect(inventory.testFiles).toContainEqual({
    file: scopeTest,
    sha256: createHash('sha256')
      .update(readFileSync(resolve(root, scopeTest)))
      .digest('hex'),
  })
  expect(
    inventory.candidates.filter((row) =>
      [
        scopeTest,
        crosshairTest,
        'src/domains/portfolio/features/holdings/features/positions/helpers/transformers/toLatestAllocationByIsin.test.ts',
        'src/domains/portfolio/shared/helpers/transformers/buildAllocationPieData.test.ts',
      ].includes(row.file),
    ),
  ).toEqual([])
  expect(inventory.contracts.map((row) => row.file)).toContain(
    'src/domains/portfolio/shared/types/rawIsinData.type.ts',
  )
  expect(inventory.candidates).toContainEqual(
    expect.objectContaining({
      file: 'src/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery.test.ts',
      verdict: 'requires-semantic-review',
    }),
  )
  expect(inventory.excluded).toContainEqual(
    expect.objectContaining({
      file: 'src/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildSavingsHistorySeries.test.ts',
      reason: 'explicit Partial override',
    }),
  )
}, 15000)
