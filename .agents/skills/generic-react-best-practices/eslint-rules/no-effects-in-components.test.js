import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noEffectsInComponents from './no-effects-in-components.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'Panel.feature.tsx') {
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
          rules: { 'no-effects-in-components': noEffectsInComponents },
        },
      },
      rules: {
        'local/no-effects-in-components': 'error',
      },
    },
    { filename },
  )
}

describe('no-effects-in-components', () => {
  it('reports useEffect and useLayoutEffect in function components', () => {
    const code = `
      import { useEffect, useLayoutEffect } from 'react'
      function Panel() {
        useEffect(() => {}, [])
        useLayoutEffect(() => {}, [])
        return <div />
      }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractEffect',
      'extractEffect',
    ])
  })

  it('recognizes named import aliases', () => {
    const code = `
      import { useEffect as useReactEffect } from 'react'
      const Panel = () => { useReactEffect(() => {}, []); return <div /> }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractEffect',
    ])
  })

  it.each([
    [
      'a namespace import',
      `import * as React from 'react'; const Panel = () => { React.useEffect(() => {}, []); return <div /> }`,
    ],
    [
      'a default import',
      `import React from 'react'; const Panel = () => { React.useLayoutEffect(() => {}, []); return <div /> }`,
    ],
  ])('recognizes effects through %s', (_name, code) => {
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractEffect',
    ])
  })

  it('allows effects isolated in custom hooks', () => {
    const code = `
      import { useEffect } from 'react'
      function useDocumentTitle() { useEffect(() => {}, []) }
      function Panel() { useDocumentTitle(); return <div /> }
    `
    expect(lint(code)).toEqual([])
  })

  it('does not mistake unrelated local functions for React effects', () => {
    const code = `
      function useEffect() {}
      function Panel() { useEffect(); return <div /> }
    `
    expect(lint(code)).toEqual([])
  })

  it.each(['Panel.test.tsx', 'Panel.spec.tsx'])('ignores %s', (filename) => {
    const code = `
      import { useEffect } from 'react'
      function Panel() { useEffect(() => {}, []); return <div /> }
    `
    expect(lint(code, filename)).toEqual([])
  })
})
