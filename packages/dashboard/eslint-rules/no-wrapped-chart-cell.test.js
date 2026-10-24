import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import noWrappedChartCell from './no-wrapped-chart-cell.js'
import noComplexJsxMap from './no-complex-jsx-map.js'

function lint(code) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.tsx'],
      languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: {
        local: {
          rules: {
            'no-wrapped-chart-cell': noWrappedChartCell,
            'no-complex-jsx-map': noComplexJsxMap,
          },
        },
      },
      rules: { 'local/no-wrapped-chart-cell': 'error', 'local/no-complex-jsx-map': 'error' },
    },
    { filename: 'Chart.view.tsx' },
  )
}

describe('Recharts Cell boundaries', () => {
  it.each([
    'function ColoredCell() { return <Cell fill="red" /> }',
    'const ColoredCell = () => <Cell fill="red" />',
    'const ColoredCell = memo(() => <Cell fill="red" />)',
  ])('rejects an opaque component wrapper: %s', (code) => {
    expect(
      lint(`import { Cell } from 'recharts'; ${code}`).map(({ messageId }) => messageId),
    ).toEqual(['directCell'])
  })

  it('allows direct slots with mapped colors and opacity', () => {
    expect(
      lint(
        `import { Cell as ChartCell } from 'recharts'; function Chart() { return <Bar>{rows.map((row) => <ChartCell key={row.id} fill={row.value < 0 ? 'red' : 'green'} />)}</Bar> }`,
      ),
    ).toEqual([])
  })

  it('does not exempt unrelated components named Cell from map delegation', () => {
    expect(
      lint(`function Chart() { return rows.map((row) => <Cell fill={color(row)} />) }`).map(
        ({ messageId }) => messageId,
      ),
    ).toEqual(['extractComponent'])
  })
})
