#!/usr/bin/env node
import { dirname, relative, resolve } from 'node:path'

import ts from 'typescript'

import { isProductionSource } from '../eslint-rules/ast-bindings.js'
import { runtimeSources } from '../eslint-rules/runtime-dependencies.js'
import { isMain, projectOptions } from './project-options.mjs'

export function findImportCycles(projectFile) {
  projectFile = resolve(projectFile)
  const config = ts.readConfigFile(projectFile, ts.sys.readFile)
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
    )
  const root = dirname(projectFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  if (parsed.errors.length)
    throw new Error(
      ts.flattenDiagnosticMessageText(parsed.errors[0].messageText, '\n'),
    )
  const roots = parsed.fileNames.filter(isProductionSource)
  const program = ts.createProgram(roots, parsed.options)
  const files = program
    .getSourceFiles()
    .filter(
      (source) =>
        !source.isDeclarationFile &&
        !program.isSourceFileFromExternalLibrary(source),
    )
    .map((source) => source.fileName)
  const resolution = ts.createModuleResolutionCache(
    root,
    (name) => (ts.sys.useCaseSensitiveFileNames ? name : name.toLowerCase()),
    parsed.options,
  )
  const eligible = new Set(files)
  const graph = new Map(
    files.toSorted().map((name) => {
      const source = program.getSourceFile(name)
      const edges = runtimeSources(source, { includeDynamic: false }).flatMap(
        (specifier) => {
          const dependency = ts.resolveModuleName(
            specifier,
            name,
            parsed.options,
            ts.sys,
            resolution,
          ).resolvedModule
          return dependency &&
            !dependency.isExternalLibraryImport &&
            eligible.has(dependency.resolvedFileName)
            ? [dependency.resolvedFileName]
            : []
        },
      )
      return [name, [...new Set(edges)].toSorted()]
    }),
  )
  const completed = new Set()
  const active = new Map()
  const stack = []
  const cycles = []
  function visit(name) {
    if (active.has(name)) {
      cycles.push(
        [...stack.slice(active.get(name)), name].map((file) =>
          relative(root, file).replaceAll('\\', '/'),
        ),
      )
      return
    }
    if (completed.has(name)) return
    active.set(name, stack.length)
    stack.push(name)
    for (const dependency of graph.get(name) ?? []) visit(dependency)
    stack.pop()
    active.delete(name)
    completed.add(name)
  }
  for (const name of graph.keys()) visit(name)
  return cycles
}

if (isMain(import.meta.url)) {
  const { project: projectFile } = projectOptions()
  const cycles = findImportCycles(projectFile)
  for (const cycle of cycles)
    console.error(`Runtime import cycle: ${cycle.join(' → ')}`)
  if (cycles.length) process.exitCode = 1
  else console.log('No synchronous runtime import cycles in production source.')
}
