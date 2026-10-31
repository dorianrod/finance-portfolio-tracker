#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import ts from 'typescript'

import { reviewFixtureCandidates } from './fixture-review.mjs'
import { isMain } from './project-options.mjs'

const TEST_PATH = /\.(?:test|spec)\.[cm]?[jt]sx?$|[/\\]__tests__[/\\]/u

export function findFixtureCandidates(root, options = {}) {
  root = resolve(root)
  const source = resolve(root, options.source ?? 'src')
  const project = resolve(root, options.project ?? 'tsconfig.app.json')
  if (
    !existsSync(source) ||
    !inside(root, source) ||
    !statSync(source).isDirectory()
  )
    throw new Error('Source must be an existing project directory.')
  const config = ts.readConfigFile(project, ts.sys.readFile)
  if (config.error) throw new Error(diagnostic(config.error))
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    resolve(project, '..'),
  )
  if (parsed.errors.length)
    throw new Error(parsed.errors.map(diagnostic).join('\n'))
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  const checker = program.getTypeChecker()
  const contracts = []
  const domainRoot = resolve(source, 'domains')
  const sources = program
    .getSourceFiles()
    .filter((file) => inside(source, file.fileName))
  const tests = sources.filter((file) => TEST_PATH.test(file.fileName))
  const included = new Set(tests.map((file) => resolve(file.fileName)))
  const omitted = ts.sys
    .readDirectory(
      source,
      ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
      ['**/node_modules/**'],
    )
    .filter((file) => TEST_PATH.test(file) && !included.has(resolve(file)))
    .map(local)
    .sort()
  if (omitted.length)
    throw new Error(
      'Tests missing from the TypeScript project: ' + omitted.join(', '),
    )
  for (const file of tests) {
    if (file.parseDiagnostics.length)
      throw new Error(
        'Cannot inspect invalid test source: ' + local(file.fileName),
      )
  }
  const diagnostics = ts.getPreEmitDiagnostics(program)
  if (diagnostics.length)
    throw new Error(
      'Cannot inspect invalid TypeScript project:\n' +
        diagnostics
          .map((value) => {
            const location =
              value.file && value.start !== undefined
                ? local(value.file.fileName) +
                  ':' +
                  (value.file.getLineAndCharacterOfPosition(value.start).line +
                    1) +
                  ': '
                : ''
            return location + diagnostic(value)
          })
          .join('\n'),
    )
  for (const file of sources) {
    if (
      !inside(domainRoot, file.fileName) ||
      !/[/\\]types[/\\][^/\\]+\.type\.ts$/u.test(file.fileName)
    )
      continue
    for (const node of file.statements) {
      if (!ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node))
        continue
      const type = checker.getTypeAtLocation(node)
      for (const variant of type.isUnion() ? type.types : [type]) {
        if (
          !(
            variant.flags &
            (ts.TypeFlags.Object | ts.TypeFlags.Intersection)
          ) ||
          checker.isArrayType(variant) ||
          checker.isTupleType(variant) ||
          variant.getCallSignatures().length
        )
          continue
        const fields = checker.getPropertiesOfType(variant)
        if (!fields.length) continue
        contracts.push({
          name: node.name.text,
          file: local(file.fileName),
          type: variant,
          fields: fields.map((field) => field.name),
          required: fields
            .filter((field) => !(field.flags & ts.SymbolFlags.Optional))
            .map((field) => field.name),
        })
      }
    }
  }
  const candidates = [],
    excluded = []
  for (const file of tests) {
    const references = new Map()
    function index(node) {
      if (ts.isIdentifier(node)) {
        const symbol =
          ts.isShorthandPropertyAssignment(node.parent) &&
          node.parent.name === node
            ? checker.getShorthandAssignmentValueSymbol(node.parent)
            : checker.getSymbolAtLocation(node)
        if (symbol) {
          const values = references.get(symbol) ?? []
          values.push(node)
          references.set(symbol, values)
        }
      }
      ts.forEachChild(node, index)
    }
    index(file)
    function visit(node) {
      if (ts.isObjectLiteralExpression(node)) inspect(node)
      ts.forEachChild(node, visit)
    }
    function inspect(node) {
      const keys = node.properties
        .filter(
          (property) =>
            ts.isPropertyAssignment(property) ||
            ts.isShorthandPropertyAssignment(property),
        )
        .map((property) => propertyName(property.name))
        .filter((name) => name !== null)
      if (!keys.length) return
      const contextual = checker.getContextualType(node)
      const actual = checker.getTypeAtLocation(node)
      const matches = contracts.filter((contract) => {
        if (!contract.required.every((key) => keys.includes(key))) return false
        if (
          keys.every((key) => contract.fields.includes(key)) &&
          checker.isTypeAssignableTo(actual, contract.type)
        )
          return true
        // A fresh literal's extra fields can fail assignability to either half
        // of an intersection while satisfying the complete contextual contract.
        return (
          contextual?.isIntersection() &&
          (contextual === contract.type ||
            contextual.types.includes(contract.type)) &&
          checker.isTypeAssignableTo(actual, contextual)
        )
      })
      if (!matches.length) return
      const entry = {
        file: local(file.fileName),
        line: file.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        column:
          file.getLineAndCharacterOfPosition(node.getStart()).character + 1,
        contracts: [
          ...new Map(
            matches.map(({ name, file }) => [
              file + ':' + name,
              { name, file },
            ]),
          ).values(),
        ],
        keys,
        contextualType: contextual ? checker.typeToString(contextual) : null,
        context: ts.SyntaxKind[node.parent.kind],
        code: node.getText(file),
      }
      const reason = exclusion(node, contextual, references)
      if (reason) excluded.push({ ...entry, reason })
      else candidates.push({ ...entry, verdict: 'requires-semantic-review' })
    }
    visit(file)
  }
  function exclusion(node, contextual, references) {
    if (inAssertion(node)) return 'expected assertion value'
    const direct = unwrap(node)
    const declaration = direct.parent
    if (
      ts.isVariableDeclaration(declaration) &&
      ts.isIdentifier(declaration.name)
    ) {
      const uses =
        references
          .get(checker.getSymbolAtLocation(declaration.name))
          ?.filter((use) => use !== declaration.name) ?? []
      if (uses.length && uses.every(inAssertion))
        return 'named expected assertion value'
    }
    if (
      contextual &&
      checker.getNonNullableType(contextual).aliasSymbol?.name === 'Partial' &&
      checker
        .getNonNullableType(contextual)
        .aliasSymbol.declarations?.some((declaration) =>
          program.isSourceFileDefaultLibrary(declaration.getSourceFile()),
        )
    )
      return 'explicit Partial override'
    if (node.properties.some(ts.isSpreadAssignment))
      return 'existing sample/state composition; partial spreads require manual review'
    for (
      let parent = node.parent;
      parent && !ts.isStatement(parent) && !ts.isFunctionLike(parent);
      parent = parent.parent
    ) {
      if (!ts.isCallExpression(parent)) continue
      const signature = checker.getResolvedSignature(parent)
      const owner = signature?.declaration?.getSourceFile().fileName ?? ''
      if (/[/\\]mocks[/\\]|\.mock\.[cm]?[jt]sx?$/u.test(owner))
        return 'owning mock consumer'
      if (
        member(parent.expression) === 'each' &&
        /[/\\](?:vitest|@vitest|@jest|@types[/\\]jest)[/\\]/u.test(owner)
      )
        return 'parametrized scenario row'
      if (
        /[/\\]yup[/\\]/u.test(owner) &&
        ['validate', 'validateSync', 'cast', 'isValid', 'isValidSync'].includes(
          member(parent.expression),
        )
      )
        return 'raw validation input'
    }
    return null
  }
  function inAssertion(node) {
    for (
      let parent = node.parent;
      parent && !ts.isStatement(parent) && !ts.isFunctionLike(parent);
      parent = parent.parent
    ) {
      if (!ts.isCallExpression(parent)) continue
      const name = callName(parent.expression)
      if (
        name !== 'expect' &&
        !/^(?:to[A-Z]|objectContaining$|arrayContaining$)/u.test(name ?? '')
      )
        return false
      const owner =
        checker.getResolvedSignature(parent)?.declaration?.getSourceFile()
          .fileName ?? ''
      if (
        /[/\\](?:vitest|@vitest|@jest|expect|@types[/\\]jest)[/\\]/u.test(owner)
      )
        return true
      return false
    }
    return false
  }
  function callName(node, seen = new Set()) {
    if (seen.has(node)) return null
    seen.add(node)
    let symbol = checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(node) ? node.name : node,
    )
    if (symbol?.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)
    const declaration = symbol?.valueDeclaration
    if (
      declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.parent.flags & ts.NodeFlags.Const &&
      declaration.initializer &&
      ts.isIdentifier(declaration.initializer)
    )
      return callName(declaration.initializer, seen)
    return symbol?.name ?? member(node)
  }
  function local(file) {
    return relative(root, file).replaceAll('\\', '/')
  }
  return {
    schemaVersion: 1,
    source: local(source),
    project: local(project),
    analysis: {
      typescript: ts.version,
      collectorSha256: hash(readFileSync(fileURLToPath(import.meta.url))),
      reviewerSha256: hash(
        readFileSync(new URL('./fixture-review.mjs', import.meta.url)),
      ),
      compilerOptionsSha256: hash(
        JSON.stringify(parsed.options).replaceAll(root, '<root>'),
      ),
      // Bind reviews to transitive authored type/consumer inputs, not only the
      // directly matched alias. Paths are relative so CI checkouts agree.
      sourceSha256: hash(
        JSON.stringify(
          sources
            .filter((file) => !TEST_PATH.test(file.fileName))
            .map((file) => [local(file.fileName), hash(file.text)])
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        ),
      ),
      lockfileSha256: existsSync(resolve(root, 'package-lock.json'))
        ? hash(readFileSync(resolve(root, 'package-lock.json')))
        : null,
    },
    testFiles: tests
      .map((file) => ({ file: local(file.fileName), sha256: hash(file.text) }))
      .sort((a, b) => a.file.localeCompare(b.file)),
    contracts: [
      ...new Map(
        contracts.map(({ file }) => [
          file,
          { file, sha256: hash(readFileSync(resolve(root, file))) },
        ]),
      ).values(),
    ].sort((a, b) => a.file.localeCompare(b.file)),
    candidates: candidates.sort(locationOrder),
    excluded: excluded.sort(locationOrder),
    limit:
      'Candidates are not violations. Review ownership, IDs, determinism and opaque/dynamic/spread builders manually. Raw transport, action arguments and case-specific data can remain candidates; structural assignability alone does not establish fixture ownership.',
  }
}

function locationOrder(a, b) {
  return a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column
}

function inside(root, file) {
  const path = relative(root, resolve(file))
  return (
    path !== '..' &&
    !path.startsWith('../') &&
    !path.startsWith('..\\') &&
    !isAbsolute(path)
  )
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function diagnostic(value) {
  return ts.flattenDiagnosticMessageText(value.messageText, '\n')
}

function unwrap(node) {
  while (
    ts.isParenthesizedExpression(node.parent) ||
    ts.isSatisfiesExpression(node.parent) ||
    ts.isAsExpression(node.parent)
  )
    node = node.parent
  return node
}

function propertyName(node) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  )
    return node.text
  if (
    ts.isComputedPropertyName(node) &&
    (ts.isStringLiteral(node.expression) ||
      ts.isNumericLiteral(node.expression))
  )
    return node.expression.text
  return null
}

function member(node) {
  if (ts.isIdentifier(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return node.name.text
  if (
    ts.isElementAccessExpression(node) &&
    ts.isStringLiteral(node.argumentExpression)
  )
    return node.argumentExpression.text
  return null
}

if (isMain(import.meta.url)) {
  try {
    const { values } = parseArgs({
      options: {
        root: { type: 'string', default: process.cwd() },
        source: { type: 'string', default: 'src' },
        project: { type: 'string', default: 'tsconfig.app.json' },
        review: { type: 'string' },
      },
    })
    const inventory = findFixtureCandidates(values.root, values)
    const result = values.review
      ? reviewFixtureCandidates(
          inventory,
          JSON.parse(readFileSync(resolve(values.root, values.review), 'utf8')),
        )
      : inventory
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
    if (values.review && result.status !== 'reviewed') process.exitCode = 1
  } catch (error) {
    process.stderr.write(
      (error instanceof Error ? error.message : String(error)) + '\n',
    )
    process.exitCode = 2
  }
}
