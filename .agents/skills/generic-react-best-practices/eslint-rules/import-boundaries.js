import { dirname, relative, resolve, sep } from 'node:path'

import ts from 'typescript'

import { importBoundaryViolation } from './import-boundary-policy.js'

const resolutionCaches = new WeakMap()
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/u

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce ownership and UI import boundaries using resolved module paths, including type-only imports',
    },
    schema: [],
    messages: {
      storybook:
        'Production code must not import Storybook configuration, stories or fixtures ({{target}}).',
      shared:
        'Shared code must not depend on the application shell or business domains ({{target}}).',
      application:
        'Business domains must not depend on the application shell ({{target}}).',
      sharedScope:
        'Shared code must not depend on a descendant feature ({{target}}); move reusable contracts or logic to the shared ownership boundary.',
      component:
        'Non-UI layers must not import renderer modules ({{target}}), including their types; place shared contracts in types/ and reusable logic in helpers/ or services/.',
      componentLogic:
        'Do not import component-owned logic from outside its owner ({{target}}); move reused contracts or helpers to their nearest common scope.',
      businessDomain:
        'Business domains must not import other business domains ({{target}}); use a common owner or an explicitly declared transverse domain.',
      siblingFeature:
        'Sibling features or sub-domains must not import each other ({{target}}); move common code to their nearest ancestor shared/ folder.',
      ancestorFeature:
        'A child feature may depend on ancestor-owned code only through shared/ ({{target}}).',
    },
  },
  create(context) {
    const filename = context.filename
    if (
      TEST_FILE.test(filename) ||
      /[/\\](?:__tests__|generated|__generated__)[/\\]/u.test(filename)
    )
      return {}

    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap)
      throw new Error('import-boundaries requires typed linting.')

    const program = services.program
    const configFile = program.getCompilerOptions().configFilePath
    const sourceRoot = resolve(
      configFile ? dirname(configFile) : program.getCurrentDirectory(),
      'src',
    )
    const source = relative(sourceRoot, filename).split(sep).join('/')
    if (source.startsWith('../') || source === '..') return {}

    let cache = resolutionCaches.get(program)
    if (!cache) {
      cache = ts.createModuleResolutionCache(
        program.getCurrentDirectory(),
        ts.sys.useCaseSensitiveFileNames
          ? (path) => path
          : (path) => path.toLowerCase(),
        program.getCompilerOptions(),
      )
      resolutionCaches.set(program, cache)
    }

    function inspect(node) {
      if (!node) return
      const tsNode = services.esTreeNodeToTSNodeMap.get(node)
      if (!tsNode || !ts.isStringLiteralLike(tsNode)) return
      const resolved = ts.resolveModuleName(
        tsNode.text,
        filename,
        program.getCompilerOptions(),
        ts.sys,
        cache,
      ).resolvedModule
      if (!resolved || resolved.isExternalLibraryImport) return

      const target = relative(sourceRoot, resolved.resolvedFileName)
        .split(sep)
        .join('/')
      if (target.startsWith('../') || target === '..') return

      const messageId = importBoundaryViolation(source, target)

      if (messageId) context.report({ node, messageId, data: { target } })
    }

    return {
      ImportDeclaration: (node) => inspect(node.source),
      ExportNamedDeclaration: (node) => inspect(node.source),
      ExportAllDeclaration: (node) => inspect(node.source),
      ImportExpression: (node) => inspect(node.source),
      TSImportType: (node) => inspect(node.source),
      TSExternalModuleReference: (node) => inspect(node.expression),
    }
  },
}
