import { dirname, relative, resolve, sep } from 'node:path'

import ts from 'typescript'

const resolutionCaches = new WeakMap()
const NON_UI_LAYER =
  /\/(?:apis|constants|helpers|schemas|services|stores|types)\//u
const COMPONENT_MODULE = /\.(?:feature|state|view)\.[cm]?[jt]sx?$/u
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/u

function componentOwner(path) {
  const match =
    /^(.*\/(?:components|pages)\/.*?)\/(?:helpers|services|stores|types)\//u.exec(
      path,
    )
  return match?.[1]
}

function isWithin(path, directory) {
  return path === directory || path.startsWith(`${directory}/`)
}

function sharedOwner(path) {
  const index = path.lastIndexOf('/shared/')
  return index === -1 ? null : path.slice(0, index)
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce ownership and UI import boundaries using resolved module paths, including type-only imports',
    },
    schema: [],
    messages: {
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

    // UI modules may render children; their helpers/services still obey the boundary.
    const nonUiSource =
      NON_UI_LAYER.test(`/${source}`) && !COMPONENT_MODULE.test(source)

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

      let messageId
      if (
        source.startsWith('shared/') &&
        (target.startsWith('app/') || target.startsWith('domains/'))
      ) {
        messageId = 'shared'
      } else if (source.startsWith('domains/') && target.startsWith('app/')) {
        messageId = 'application'
      } else {
        const owner = sharedOwner(`/${source}`)
        if (
          owner &&
          isWithin(`/${target}`, owner) &&
          !isWithin(`/${target}`, `${owner}/shared`)
        ) {
          messageId = 'sharedScope'
        } else if (nonUiSource && COMPONENT_MODULE.test(target)) {
          messageId = 'component'
        } else if (nonUiSource) {
          const targetOwner = componentOwner(`/${target}`)
          if (targetOwner && !isWithin(`/${source}`, targetOwner))
            messageId = 'componentLogic'
        }
      }

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
