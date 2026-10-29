import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const filePath = resolve(
  directory,
  'src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/useDataQualityViewModel.ts',
)
const eslint = new ESLint({ cwd: directory })

beforeAll(async () => {
  await eslint.lintText('', { filePath })
}, 20_000)

const imports = `
import * as React from 'react';
import {useMemo as memo, useEffect} from 'react';
import {partitionPercentages as calculate} from '@/shared/helpers/calculators/partitionPercentages';
import * as metrics from '@/shared/helpers/calculators/partitionPercentages';
`

async function lint(code, filename = filePath) {
  const [result] = await eslint.lintText(`${imports}\n${code}`, {
    filePath: filename,
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-memo-only-service',
  )
}

describe('memoized helper placement through the application configuration', () => {
  it.each([
    'export function useTotals(values: number[]) { return memo(() => calculate(values), [values]) }',
    'export const useTotals = (values: number[]) => React.useMemo(() => calculate(values), [values])',
    "export function useTotals({values}: {values: number[]}) { return React['useMemo'](() => metrics.partitionPercentages(values), [values]) }",
    'const cache = memo; const sum = calculate; const useTotals = (values: number[]) => cache(() => { return sum(values) }, [values]); export {useTotals}',
  ])('rejects a service that only memoizes a helper: %s', async (code) => {
    expect(await lint(code)).toMatchObject([
      { messageId: 'helper', severity: 2 },
    ])
  })

  it.each([
    'export function useTotals(values: number[]) { useEffect(() => console.log(values), [values]); return memo(() => calculate(values), [values]) }',
    'export function useTotals(values: number[], onSave: () => number[]) { return memo(() => calculate(onSave()), [values, onSave]) }',
    'export function useTotals(values: number[], calculate: (values: number[]) => number[]) { return memo(() => calculate(values), [values, calculate]) }',
    'export function useTotals(values: number[], memo: typeof React.useMemo) { return memo(() => calculate(values), [values]) }',
    'export function useTotals(values: number[]) { return memo(() => { console.log(values); return calculate(values) }, [values]) }',
    'export function useTotals(values: number[]) { return calculate(values) }',
    'export function useTotals(values: number[] = calculate([1])) { return memo(() => calculate(values), [values]) }',
    'export function useTotals(values: number[]) { return memo(() => calculate(values), [calculate(values)]) }',
    'export function useTotals(values: number[], metrics: {partitionPercentages: typeof calculate}) { return memo(() => metrics.partitionPercentages(values), [values]) }',
  ])('preserves effectful and unresolved services: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })

  it('allows the same memoized transformation in a categorized helper', async () => {
    expect(
      await lint(
        'export function useTotals(values: number[]) { return memo(() => calculate(values), [values]) }',
        resolve(directory, 'src/shared/helpers/formatters/useFormatNumber.ts'),
      ),
    ).toEqual([])
  })
})
