import { relative, resolve, sep } from 'node:path'

import ts from 'typescript'

import { businessScopes, sharedOwner } from './business-ownership.js'
import { importBoundaryViolation } from './import-boundary-policy.js'

const analyses = new WeakMap()
const NON_PRODUCTION =
  /\.(?:test|spec|stories|mock|fixture|fixtures|generated)\.[cm]?[jt]sx?$|\/(?:__tests__|__mocks__|mocks|storybook|generated|__generated__)\//u

function moduleReferences(source) {
  const references = []
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier))
        references.push(node.moduleSpecifier.text)
    } else if (ts.isImportEqualsDeclaration(node)) {
      const expression = node.moduleReference.expression
      if (expression && ts.isStringLiteralLike(expression))
        references.push(expression.text)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      if (node.arguments[0] && ts.isStringLiteralLike(node.arguments[0]))
        references.push(node.arguments[0].text)
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      references.push(node.argument.literal.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return references
}

function analyzeSharedConsumers(file, reverseDependencies) {
  const owner = sharedOwner(file)
  if (!owner) return null
  const features = new Set()
  const externalConsumers = new Set()
  const visited = new Set([file])
  const pending = [...(reverseDependencies.get(file) ?? [])]
  while (pending.length) {
    const consumer = pending.pop()
    if (visited.has(consumer) || NON_PRODUCTION.test(consumer)) continue
    visited.add(consumer)
    const scopes = businessScopes(consumer)
    const ownerIndex = scopes.indexOf(owner)
    const feature = ownerIndex === -1 ? null : scopes[ownerIndex + 1]
    if (feature) {
      features.add(feature)
    } else {
      if (!consumer.startsWith(`${owner}/shared/`))
        externalConsumers.add(consumer)
      pending.push(...(reverseDependencies.get(consumer) ?? []))
    }
  }
  return {
    owner,
    features: [...features].sort(),
    externalConsumers: [...externalConsumers].sort(),
    consumers: visited.size - 1,
  }
}

export function sharedFeatureUsageAnalysis(program, sourceRoot) {
  let byRoot = analyses.get(program)
  if (!byRoot) {
    byRoot = new Map()
    analyses.set(program, byRoot)
  }
  if (byRoot.has(sourceRoot)) return byRoot.get(sourceRoot)
  const reverseDependencies = new Map()
  const invalidDependencies = new Set()
  const sources = new Map()
  const localPath = (filename) =>
    relative(sourceRoot, filename).split(sep).join('/')
  for (const source of program.getSourceFiles()) {
    const path = localPath(source.fileName)
    if (
      source.isDeclarationFile ||
      path.startsWith('../') ||
      NON_PRODUCTION.test(path)
    )
      continue
    sources.set(path, source)
  }
  const resolutionCache = ts.createModuleResolutionCache(
    program.getCurrentDirectory(),
    (path) => path,
    program.getCompilerOptions(),
  )
  const checker = program.getTypeChecker()
  function addDependency(source, target) {
    if (!sources.has(target) || importBoundaryViolation(source, target)) return
    if (!reverseDependencies.has(target))
      reverseDependencies.set(target, new Set())
    reverseDependencies.get(target).add(source)
  }
  for (const [path, source] of sources) {
    const facade =
      Boolean(sharedOwner(path)) &&
      source.statements.some(ts.isExportDeclaration) &&
      source.statements.every(
        (node) =>
          ts.isImportDeclaration(node) ||
          ts.isExportDeclaration(node) ||
          ts.isExportAssignment(node),
      )
    for (const reference of moduleReferences(source)) {
      const module = ts.resolveModuleName(
        reference,
        source.fileName,
        program.getCompilerOptions(),
        ts.sys,
        resolutionCache,
      ).resolvedModule
      if (!module || module.isExternalLibraryImport) continue
      const target = localPath(module.resolvedFileName)
      if (importBoundaryViolation(path, target)) {
        invalidDependencies.add(path)
        continue
      }
      if (!facade) addDependency(path, target)
    }
    // A facade exporting A and B is not evidence that A's consumers also use B.
    // TypeScript follows named aliases to their actual declaration modules.
    if (facade) continue
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause)
        continue
      const clause = statement.importClause
      const bindings = clause.namedBindings
      const names = [
        ...(clause.name ? [clause.name] : []),
        ...(bindings && ts.isNamedImports(bindings)
          ? bindings.elements.map((binding) => binding.name)
          : []),
      ]
      for (const name of names) {
        let symbol = checker.getSymbolAtLocation(name)
        if (symbol?.flags & ts.SymbolFlags.Alias)
          symbol = checker.getAliasedSymbol(symbol)
        for (const declaration of symbol?.declarations ?? [])
          addDependency(path, localPath(declaration.getSourceFile().fileName))
      }
    }
  }
  const result = new Map()
  for (const path of sources.keys()) {
    const usage = analyzeSharedConsumers(path, reverseDependencies)
    if (usage)
      result.set(resolve(sourceRoot, path), {
        ...usage,
        hasInvalidDependencies: invalidDependencies.has(path),
      })
  }
  byRoot.set(sourceRoot, result)
  return result
}
