import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noComplexComponentCalculation from './no-complex-component-calculation.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'Panel.view.tsx', options = {}) {
  return linter.verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: {
        local: {
          rules: {
            'no-complex-component-calculation': noComplexComponentCalculation,
          },
        },
      },
      rules: {
        'local/no-complex-component-calculation': ['error', options],
      },
    },
    { filename },
  )
}

describe('no-complex-component-calculation', () => {
  it.each([
    'const total = row.allocated + row.unallocated; const percentage = total > 0 ? row.unallocated / total * 100 : 0; return <span>{percentage}</span>',
    'const percentage = total > 0 ? value / total * 100 : 0; return <Meter value={Math.min(percentage, 100)} />',
    'const percentage = value / total * 100; const alias = percentage; return <Meter value={Math.min(alias, 100)} />',
    'return rows.map((row, index) => ({ share: row.gain / row.cost * 100, change: row.value - rows[index - 1].value }))',
    'return <foreignObject x={x - WIDTH} y={y - 10} width={WIDTH - 10} height={20} />',
  ])(
    'follows a complete local derivation across variables, map fields or geometry props: %s',
    (body) => {
      expect(
        lint(`function Panel({row, rows, value, x, y}) { ${body} }`).map(
          (message) => message.messageId,
        ),
      ).toEqual(['extractCalculation'])
    },
  )

  it('keeps independent small calculations independent', () => {
    expect(
      lint(
        'function Panel() { const first = a + b; const second = c + d; return <span>{first} {second}</span> }',
      ),
    ).toEqual([])
  })

  it.each([
    'const dimensions = { width: size + 8, height: size + 8, left: x + 8 }; return <div>{dimensions.width / 2}</div>',
    'const name = a + b * c; return rows.map(row => ({ name: row.label, change: row.end - row.start }))',
    'const coordinate = a + b * c; return <rect x={coordinate} y={coordinate} />',
  ])(
    'does not count unrelated properties, object keys or a shared geometry initializer twice: %s',
    (body) => {
      expect(lint(`function Panel() { ${body} }`)).toEqual([])
    },
  )

  it('does not trace reassigned variables as immutable calculations', () => {
    expect(
      lint(
        'function Panel() { let percentage = value / total * 100; percentage = input; return <Meter value={Math.min(percentage, 100)} /> }',
      ),
    ).toEqual([])
  })
  it.each([
    'Panel.view.tsx',
    'Panel.feature.tsx',
    'Panel.state.tsx',
    'Panel.tsx',
  ])(
    'reports tooltip positioning calculations before JSX in %s',
    (filename) => {
      const code = `
        export function Panel({ anchor, sources }) {
          const width = Math.min(340, window.innerWidth - 16)
          const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8))
          const below = anchor.bottom + 8 + 40 + sources.length * 24 < window.innerHeight
          const position = below ? { top: anchor.bottom + 6 } : { bottom: window.innerHeight - anchor.top + 6 }
          return <div style={{ left, width, ...position }} />
        }
      `
      expect(
        lint(code, filename).map(({ messageId, line }) => ({
          messageId,
          line,
        })),
      ).toEqual([
        { messageId: 'extractCalculation', line: 4 },
        { messageId: 'extractCalculation', line: 5 },
      ])
    },
  )

  it.each([
    [
      'JSX styles',
      'return <div style={{ left: Math.max(8, Math.min(x, width - 8)) }} />',
    ],
    [
      'a formatter argument',
      'return <span>{formatNumber((Math.abs(value) / maximum) * 100)}</span>',
    ],
    [
      'useMemo',
      'const position = useMemo(() => Math.max(8, Math.min(x, width - 8)), [x, width]); return <div />',
    ],
    [
      'a named local function',
      'function getPosition() { return Math.max(8, Math.min(x, width - 8)) }; return <div />',
    ],
    [
      'an event handler',
      'return <button onClick={() => resize(Math.max(8, Math.min(x, width - 8)))} />',
    ],
    [
      'a map callback',
      'return items.map(item => <div style={{ left: Math.max(8, Math.min(item.x, width - 8)) }} />)',
    ],
    [
      'TypeScript assertions',
      'const x = Math.max(8, (Math.min(value, width - 8) as number)!); return <div />',
    ],
    [
      'computed Math access',
      "const x = Math['max'](8, Math.min(value, width - 8)); return <div />",
    ],
  ])('reports calculations in %s once per expression', (_name, body) => {
    expect(
      lint(`function Panel() { ${body} }`).map(({ messageId }) => messageId),
    ).toEqual(['extractCalculation'])
  })

  it.each([
    'export const Panel = () => <div>{x + y * z / 2}</div>',
    'export const Panel = memo(() => <div>{x + y * z / 2}</div>)',
    'export const Panel = React.forwardRef((props, ref) => <div ref={ref}>{x + y * z / 2}</div>)',
    'export const Panel = (() => <div>{x + y * z / 2}</div>) satisfies Component',
    'export const Panel = memo((() => <div>{x + y * z / 2}</div>) as Component)',
    'export default () => <div>{x + y * z / 2}</div>',
  ])('recognizes component syntax: %s', (code) => {
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractCalculation',
    ])
  })

  it('allows hooks, helper calls, simple rendering decisions and small arithmetic expressions', () => {
    const code = `
      function Panel({ anchor, rows, value, total, open }) {
        const formatNumber = useFormatNumber()
        const style = getPanelStyle(anchor, rows.length, { width: window.innerWidth, height: window.innerHeight })
        const percentage = total > 0 ? (value / total) * 100 : 0
        return <button style={style} disabled={!open || rows.length === 0} onClick={() => setCount(count => count + 1)}>
          {open ? formatNumber(percentage) : rows.length}
        </button>
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('does not add unrelated calculations in an object or separate callback to the same expression', () => {
    const code = `
      function Panel() {
        const style = { left: x + 8, top: y + 8, width: size - 16 }
        const limit = Math.max(0, ...items.map(item => Math.abs(item.value)))
        return <div style={style}>{limit}</div>
      }
    `
    expect(lint(code)).toEqual([])
  })

  it.each([
    [
      'Panel.test.tsx',
      'function Panel() { return <div>{x + y * z / 2}</div> }',
    ],
    [
      'Panel.spec.tsx',
      'function Panel() { return <div>{x + y * z / 2}</div> }',
    ],
    [
      'getPanelStyle.ts',
      'export function getPanelStyle() { return Math.max(8, Math.min(x, width - 8)) }',
    ],
    [
      'usePanelStyle.ts',
      'export function usePanelStyle() { return Math.max(8, Math.min(x, width - 8)) }',
    ],
    [
      'Panel.view.tsx',
      'const DEFAULT_WIDTH = Math.max(8, Math.min(340, width - 8))',
    ],
  ])(
    'allows calculations outside production components in %s',
    (filename, code) => {
      expect(lint(code, filename)).toEqual([])
    },
  )

  it('can enforce a stricter threshold without duplicate reports', () => {
    expect(
      lint(
        'function Panel() { return <div>{Math.min(340, width - 16)}</div> }',
        'Panel.view.tsx',
        { maxOperations: 1 },
      ).map(({ messageId }) => messageId),
    ).toEqual(['extractCalculation'])
  })
})
