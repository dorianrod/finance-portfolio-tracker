import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import noReactContext from './no-react-context.js'

function lint(code, filename = 'src/shared/ui/Example.view.jsx') {
  return new Linter().verify(
    code,
    {
      files: ['**/*.jsx'],
      plugins: { local: { rules: { 'no-react-context': noReactContext } } },
      rules: { 'local/no-react-context': 'error' },
    },
    { filename },
  )
}

describe('no-react-context', () => {
  it.each([
    'import { createContext } from "react"; const state = createContext(null)',
    'import { createContext as create } from "react"; const state = create(null)',
    'import React from "react"; const state = React.createContext(null)',
    'import * as React from "react"; const state = React["createContext"](null)',
  ])('rejects project-owned contexts: %s', (code) => {
    expect(lint(code)).toMatchObject([{ messageId: 'context' }])
  })

  it('allows library providers and hooks', () => {
    expect(
      lint('import { atom, useAtomValue } from "jotai"; const value = atom(0)'),
    ).toEqual([])
  })

  it('does not confuse another library or a local method with React', () => {
    expect(
      lint(
        'import { createContext } from "other-library"; createContext(null); const object = { createContext() {} }; object.createContext()',
      ),
    ).toEqual([])
  })

  it.each([
    'import { createContext } from "react"; function call(createContext) { return createContext() }',
    'import React from "react"; function call(React) { return React.createContext() }',
  ])('does not report shadowed imports: %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it.each(['test', 'spec', 'stories'])(
    'allows isolated %s fixtures',
    (suffix) => {
      expect(
        lint(
          'import { createContext } from "react"; createContext(null)',
          `src/Example.${suffix}.jsx`,
        ),
      ).toEqual([])
    },
  )
})
