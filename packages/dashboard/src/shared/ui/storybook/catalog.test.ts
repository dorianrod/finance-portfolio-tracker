import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const catalogDirectory = import.meta.dirname
const uiDirectory = resolve(catalogDirectory, '..')

function parse(path: string) {
  return ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
}

function examplesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return examplesIn(path)
    return entry.name.endsWith('.tsx') ? [path] : []
  })
}

function demonstratedComponents() {
  const demonstrated = new Set<string>()
  for (const path of examplesIn(catalogDirectory)) {
    const source = parse(path)
    const imports = new Map<string, string>()
    for (const node of source.statements) {
      if (
        !ts.isImportDeclaration(node) ||
        !ts.isStringLiteral(node.moduleSpecifier)
      )
        continue
      const specifiers = node.importClause?.namedBindings
      if (!specifiers || !ts.isNamedImports(specifiers)) continue
      const modulePath = node.moduleSpecifier.text
      const target = modulePath.startsWith('@/')
        ? resolve(catalogDirectory, '../../..', modulePath.slice(2))
        : resolve(dirname(path), modulePath)
      for (const specifier of specifiers.elements) {
        imports.set(
          specifier.name.text,
          `${target}#${(specifier.propertyName ?? specifier.name).text}`,
        )
      }
    }
    function visit(node: ts.Node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const [root, ...slots] = node.tagName.getText(source).split('.')
        const component = imports.get(root)
        if (component) demonstrated.add([component, ...slots].join('.'))
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return demonstrated
}

describe('shared UI Storybook catalog', () => {
  const demonstrated = demonstratedComponents()
  const modules = readdirSync(uiDirectory).filter((name) =>
    name.endsWith('.view.tsx'),
  )

  it.each(modules)(
    'demonstrates every public component and slot in %s',
    (filename) => {
      const path = resolve(uiDirectory, filename)
      const source = parse(path)
      const modulePath = path.slice(0, -4)
      const components: string[] = []
      for (const node of source.statements) {
        if (
          ts.isFunctionDeclaration(node) &&
          node.name &&
          node.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          )
        ) {
          components.push(node.name.text)
        }
        if (
          ts.isExpressionStatement(node) &&
          ts.isBinaryExpression(node.expression) &&
          node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isPropertyAccessExpression(node.expression.left)
        ) {
          const slot = node.expression.left
          if (
            ts.isIdentifier(slot.expression) &&
            components.includes(slot.expression.text)
          )
            components.push(slot.getText(source))
        }
      }
      expect(components.length).toBeGreaterThan(0)
      for (const component of components)
        expect(
          demonstrated.has(`${modulePath}#${component}`),
          `Missing JSX example for ${component}`,
        ).toBe(true)
    },
  )
})
