#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import ts from 'typescript'

import { isMain } from './project-options.mjs'

const RUNTIME = ['component', 'hook', 'helper', 'service', 'store']
const EXCLUDED = ['type-only', 'fixture', 'story', 'support', 'asset']
const EXTENSION = /\.[cm]?[jt]sx?$/u
const TEST = /\.(?:test|spec)\.[cm]?[jt]sx?$/u
const hash = (text) => createHash('sha256').update(text).digest('hex')

export function snapshotSources(root, source = 'src') {
  const sourceRoot = resolve(root, source)
  if (!existsSync(sourceRoot) || relative(root, sourceRoot).startsWith('..'))
    throw new Error('Source must be an existing project directory.')
  const files = []
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const full = join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error('Source symlinks need an explicit inventory: ' + full)
      if (entry.isDirectory()) {
        if (
          !['node_modules', 'dist', 'audit', '.git', 'coverage'].includes(
            entry.name,
          )
        )
          visit(full)
        continue
      }
      const file = relative(root, full).replaceAll('\\', '/')
      const text = readFileSync(full)
      let role = 'asset',
        bodyHash = hash(text)
      if (EXTENSION.test(file)) {
        const code = text.toString('utf8')
        const ast = ts.createSourceFile(
          full,
          code,
          ts.ScriptTarget.Latest,
          true,
        )
        if (ast.parseDiagnostics.length)
          throw new Error('Cannot classify invalid source: ' + file)
        const body = ast.statements
          .filter((node) => !ts.isImportDeclaration(node))
          .map((node) => node.getText(ast))
          .join('\n')
        const scanner = ts.createScanner(
          ts.ScriptTarget.Latest,
          true,
          ts.LanguageVariant.JSX,
          body,
        )
        const tokens = []
        for (
          let token = scanner.scan();
          token !== ts.SyntaxKind.EndOfFileToken;
          token = scanner.scan()
        )
          tokens.push([token, scanner.getTokenText()])
        bodyHash = hash(JSON.stringify(tokens))
        const exported = ast.statements.filter(
          (node) =>
            ts.canHaveModifiers(node) &&
            ts
              .getModifiers(node)
              ?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
              ),
        )
        const values = exported.filter(
          (node) =>
            !ts.isTypeAliasDeclaration(node) &&
            !ts.isInterfaceDeclaration(node),
        )
        const names = values.flatMap((node) =>
          ts.isVariableStatement(node)
            ? node.declarationList.declarations.map((declaration) =>
                declaration.name.getText(ast),
              )
            : [node.name?.getText(ast) ?? ''],
        )
        if (TEST.test(file) || file.includes('/__tests__/')) role = 'support'
        else if (/\.mock\.|\/mocks\//u.test(file)) role = 'fixture'
        else if (/\.stories\.|\/storybook\//u.test(file)) role = 'story'
        else if (
          /\.d\.[cm]?ts$/u.test(file) ||
          (exported.length > 0 && !values.length)
        )
          role = 'type-only'
        else if (/\.(?:view|feature|state)\.tsx$/u.test(file))
          role = 'component'
        else if (names.some((name) => /^use[A-Z]/u.test(name))) role = 'hook'
        else if (values.length && file.includes('/helpers/')) role = 'helper'
        else if (values.length && file.includes('/services/')) role = 'service'
        else if (
          values.length &&
          (file.includes('/stores/') || /\.(?:store|atoms)\.ts$/u.test(file))
        )
          role = 'store'
        else if (
          file === source.replaceAll('\\', '/') + '/main.tsx' ||
          values.every(
            (node) =>
              ts.isVariableStatement(node) &&
              node.declarationList.declarations.every(
                (declaration) =>
                  !declaration.initializer ||
                  ts.isLiteralExpression(declaration.initializer) ||
                  [
                    ts.SyntaxKind.TrueKeyword,
                    ts.SyntaxKind.FalseKeyword,
                    ts.SyntaxKind.NullKeyword,
                  ].includes(declaration.initializer.kind) ||
                  ts.isObjectLiteralExpression(declaration.initializer) ||
                  ts.isArrayLiteralExpression(declaration.initializer),
              ),
          )
        )
          role = 'support'
        else role = 'unresolved'
      }
      const sibling =
        EXTENSION.test(file) && !TEST.test(file)
          ? (['test', 'spec']
              .flatMap((kind) =>
                ['ts', 'tsx', 'js', 'jsx', 'mts', 'mjs', 'cts', 'cjs'].map(
                  (extension) =>
                    file.replace(EXTENSION, '.' + kind + '.' + extension),
                ),
              )
              .find((candidate) => existsSync(resolve(root, candidate))) ??
            null)
          : null
      files.push({ file, sha256: hash(text), bodyHash, role, sibling })
    }
  }
  visit(sourceRoot)
  return {
    schemaVersion: 1,
    source: relative(root, sourceRoot).replaceAll('\\', '/'),
    files,
  }
}

function inventory(input) {
  if (
    input?.schemaVersion !== 1 ||
    !Array.isArray(input.files) ||
    typeof input.source !== 'string' ||
    !input.source.trim() ||
    isAbsolute(input.source) ||
    input.source.split('/').includes('..')
  )
    throw new Error('Expected a version-1 source snapshot.')
  const map = new Map()
  for (const row of input.files) {
    if (
      typeof row.file !== 'string' ||
      !row.file.startsWith(input.source + '/') ||
      row.file.includes('\\') ||
      isAbsolute(row.file) ||
      row.file.split('/').includes('..') ||
      map.has(row.file) ||
      !/^[a-f0-9]{64}$/u.test(row.sha256) ||
      !/^[a-f0-9]{64}$/u.test(row.bodyHash) ||
      ![...RUNTIME, ...EXCLUDED, 'unresolved'].includes(row.role) ||
      (row.sibling !== null && typeof row.sibling !== 'string')
    )
      throw new Error('Invalid snapshot file: ' + String(row.file))
    map.set(row.file, row)
  }
  return map
}

export function checkTestColocation(
  baseline,
  current,
  provenance = { moves: [], roles: [] },
) {
  const before = inventory(baseline),
    after = inventory(current)
  if (
    baseline.source !== current.source ||
    !Array.isArray(provenance.moves) ||
    !Array.isArray(provenance.roles)
  )
    throw new Error(
      'Snapshots/provenance do not describe the same source scope.',
    )
  const moves = new Map(),
    roles = new Map(),
    origins = new Set()
  for (const move of provenance.moves) {
    const previous = before.get(move.from),
      next = after.get(move.to)
    if (
      !previous ||
      !next ||
      after.has(move.from) ||
      before.has(move.to) ||
      moves.has(move.to) ||
      origins.has(move.from) ||
      move.previousSha256 !== previous.sha256 ||
      move.sha256 !== next.sha256 ||
      typeof move.reason !== 'string' ||
      !move.reason.trim()
    )
      throw new Error('Invalid, stale or duplicate move provenance.')
    origins.add(move.from)
    moves.set(move.to, { ...move, previous })
  }
  for (const review of provenance.roles) {
    const next = after.get(review.file)
    if (
      !next ||
      next.role !== 'unresolved' ||
      review.sha256 !== next.sha256 ||
      ![...RUNTIME, ...EXCLUDED].includes(review.role) ||
      typeof review.reason !== 'string' ||
      !review.reason.trim() ||
      roles.has(review.file)
    )
      throw new Error('Invalid or stale role review.')
    roles.set(review.file, review)
  }
  const rows = []
  for (const next of after.values()) {
    if (before.has(next.file)) continue
    const role = roles.get(next.file)?.role ?? next.role
    const move = moves.get(next.file)
    let status, reason
    if (
      move &&
      move.previous.bodyHash !== next.bodyHash &&
      move.sameContract !== true
    ) {
      status = 'pending'
      reason =
        'Changed move requires explicit same-contract review or classification as introduced.'
    } else if (move && move.previous.sibling && !next.sibling) {
      status = 'missing'
      reason = 'The moved owner lost its sibling test.'
    } else if (move) {
      status = 'moved'
      reason =
        'Reviewed existing contract; historical absence does not establish a new-file violation.'
    } else if (role === 'unresolved') {
      status = 'pending'
      reason = 'Runtime contract requires role review.'
    } else if (RUNTIME.includes(role)) {
      status = next.sibling ? 'present' : 'missing'
      reason = 'Introduced runtime owner requires a sibling test.'
    } else {
      status = 'not-applicable'
      reason = 'Outside the new runtime-owner testing contract: ' + role
    }
    rows.push({
      file: next.file,
      role,
      status,
      reason,
      sibling: next.sibling,
      provenance: move
        ? { from: move.from, reason: move.reason }
        : (roles.get(next.file) ?? null),
    })
  }
  return {
    schemaVersion: 1,
    rows,
    missing: rows.filter((row) => row.status === 'missing').length,
    pending: rows.filter((row) => row.status === 'pending').length,
    limit:
      'Presence does not establish meaningful nominal/error coverage; role and same-contract reviews remain semantic evidence.',
  }
}

if (isMain(import.meta.url)) {
  try {
    const { values } = parseArgs({
      options: {
        root: { type: 'string', default: process.cwd() },
        source: { type: 'string', default: 'src' },
        snapshot: { type: 'boolean' },
        baseline: { type: 'string' },
        provenance: { type: 'string' },
      },
    })
    const current = snapshotSources(resolve(values.root), values.source)
    if (!values.snapshot && !values.baseline)
      throw new Error('Pass --snapshot, or --baseline <snapshot.json>.')
    const result = values.snapshot
      ? current
      : checkTestColocation(
          JSON.parse(readFileSync(values.baseline, 'utf8')),
          current,
          values.provenance
            ? JSON.parse(readFileSync(values.provenance, 'utf8'))
            : undefined,
        )
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
    if (!values.snapshot && (result.missing || result.pending))
      process.exitCode = 1
  } catch (error) {
    process.stderr.write(String(error.message) + '\n')
    process.exitCode = 2
  }
}
