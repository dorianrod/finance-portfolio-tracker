import { dirname, resolve } from 'node:path'

import ts from 'typescript'

const caches = new WeakMap()

export function staticModuleSource(node) {
  if (typeof node?.value === 'string') return node.value
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked
  return null
}

export function typeOnlyImport(node) {
  return (
    node.importKind === 'type' ||
    (node.specifiers.length > 0 &&
      node.specifiers.every((specifier) => specifier.importKind === 'type'))
  )
}

export function typeOnlyExport(node) {
  return (
    node.exportKind === 'type' ||
    (node.specifiers?.length > 0 &&
      node.specifiers.every((specifier) => specifier.exportKind === 'type'))
  )
}

// Module-level runtime dependencies are intentional: importing one value still
// evaluates the module's other value imports and reexports. Type edges are erased.
export function runtimeSources(sourceFile, { includeDynamic = true } = {}) {
  const sources = []
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause
      if (clause?.isTypeOnly) return
      const bindings = clause?.namedBindings
      if (
        !clause?.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 &&
        bindings.elements.every((element) => element.isTypeOnly)
      )
        return
      if (ts.isStringLiteralLike(node.moduleSpecifier))
        sources.push(node.moduleSpecifier.text)
      return
    }
    if (ts.isExportDeclaration(node)) {
      if (node.isTypeOnly || !node.moduleSpecifier) return
      if (
        node.exportClause &&
        ts.isNamedExports(node.exportClause) &&
        node.exportClause.elements.length > 0 &&
        node.exportClause.elements.every((element) => element.isTypeOnly)
      )
        return
      if (ts.isStringLiteralLike(node.moduleSpecifier))
        sources.push(node.moduleSpecifier.text)
      return
    }
    if (
      includeDynamic &&
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    )
      sources.push(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return sources
}

export function runtimeDependencies(context) {
  const program = context.sourceCode.parserServices?.program
  let cache = program && caches.get(program)
  if (program && !cache) {
    cache = {
      resolution: ts.createModuleResolutionCache(
        program.getCurrentDirectory(),
        ts.sys.useCaseSensitiveFileNames
          ? (name) => name
          : (name) => name.toLowerCase(),
        program.getCompilerOptions(),
      ),
      sources: new Map(),
    }
    caches.set(program, cache)
  }
  function resolveSource(source, filename) {
    if (program) {
      const target = ts.resolveModuleName(
        source,
        filename,
        program.getCompilerOptions(),
        ts.sys,
        cache.resolution,
      ).resolvedModule
      if (target && !target.isExternalLibraryImport)
        return target.resolvedFileName.replaceAll('\\', '/')
    }
    if (source.startsWith('@/')) return `/src/${source.slice(2)}`
    if (source.startsWith('.'))
      return resolve(dirname(filename), source).replaceAll('\\', '/')
    return null
  }
  function trace(source, predicate, { stop = () => false } = {}) {
    const visited = new Set([context.filename.replaceAll('\\', '/')])
    function walk(specifier, importer, chain) {
      const target = resolveSource(specifier, importer)
      const next = [...chain, specifier]
      const match = predicate(specifier, target, chain.length)
      if (match) return { match, chain: next }
      if (!program || !target || visited.has(target) || stop(target))
        return null
      visited.add(target)
      const file = program.getSourceFile(target)
      if (!file || file.isDeclarationFile || /\/node_modules\//u.test(target))
        return null
      let sources = cache.sources.get(file)
      if (!sources) {
        sources = runtimeSources(file)
        cache.sources.set(file, sources)
      }
      for (const dependency of sources) {
        const found = walk(dependency, target, next)
        if (found) return found
      }
      return null
    }
    return walk(source, context.filename, [])
  }
  return { resolveSource, trace }
}
