import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import maxHooksPerComponent from './max-hooks-per-component.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'Dashboard.feature.tsx', max = 6) {
  return linter.verify(
    code,
    {
      files: ['**/*.tsx'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      plugins: {
        local: {
          rules: { 'max-hooks-per-component': maxHooksPerComponent },
        },
      },
      rules: {
        'local/max-hooks-per-component': ['error', { max }],
      },
    },
    { filename },
  )
}

describe('max-hooks-per-component', () => {
  it('allows a component at the configured hook limit', () => {
    const code = `
      function Dashboard() {
        useA(); useB(); useC(); useD(); useE(); useF()
        return <div />
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('reports one warning when a component exceeds the hook limit', () => {
    const code = `
      function Dashboard() {
        useA(); useB(); useC(); useD(); useE(); useF(); useG()
        return <div />
      }
    `
    const messages = lint(code)
    expect(messages.map(({ messageId }) => messageId)).toEqual(['tooManyHooks'])
    expect(messages[0].message).toContain('uses 7 direct hooks (maximum: 6)')
  })

  it('counts components separately and ignores hooks inside nested functions', () => {
    const code = `
      function Large() {
        useA(); useB(); useC(); useD(); useE(); useF(); useG()
        const callback = () => { useNested() }
        return <button onClick={callback} />
      }
      function Small() { useA(); return <div /> }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'tooManyHooks',
    ])
  })

  it.each([
    [
      'memo',
      'const Dashboard = memo(() => { useA(); useB(); return <div /> })',
    ],
    [
      'forwardRef',
      'const Dashboard = forwardRef((props, ref) => { useA(); useB(); return <div ref={ref} /> })',
    ],
    [
      'React member hooks',
      'const Dashboard = () => { React.useState(); React.useMemo(); return <div /> }',
    ],
  ])('recognizes %s components and hooks', (_name, code) => {
    expect(
      lint(code, 'Dashboard.feature.tsx', 1).map(({ messageId }) => messageId),
    ).toEqual(['tooManyHooks'])
  })

  it.each(['Dashboard.test.tsx', 'Dashboard.spec.tsx'])(
    'ignores components in %s',
    (filename) => {
      const code = 'function Dashboard() { useA(); useB(); return <div /> }'
      expect(lint(code, filename, 1)).toEqual([])
    },
  )
})
