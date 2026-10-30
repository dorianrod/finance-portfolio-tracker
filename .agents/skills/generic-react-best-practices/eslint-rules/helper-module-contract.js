import { basename } from 'node:path'

import ts from 'typescript'

import {
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { getPublicExports } from './get-public-exports.js'
import {
  HELPER_CATEGORIES,
  helperCategory,
  moduleRoles,
} from './helper-categories.js'
import { libraryBinding } from './library-binding.js'
import {
  runtimeDependencies,
  staticModuleSource,
  typeOnlyExport,
  typeOnlyImport,
} from './runtime-dependencies.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep helpers categorized and name their modules after their public callable export',
    },
    schema: [],
    messages: {
      category:
        'Use helpers/transformers, helpers/formatters or helpers/presenters; "{{category}}" is not a helper category. Classify by the exposed contract. [helpers-categories]',
      name: 'Name the helper file after its public callable export "{{name}}". Coordinate the rename with its callers. [helpers-categories]',
      logic:
        'Replace the .logic suffix with the helper’s public name and choose its category by responsibility. [arch-component-module-boundaries]',
      dependency:
        'Keep API/schema adaptation, data acquisition, business state and services outside helpers. Runtime dependency: {{chain}}. Pass validated data explicitly. [helpers-categories]',
      effect:
        'Keep {{name}} outside helpers; helpers derive values without effects or writable state. Use a component or service for this behavior. [arch-helpers-vs-services]',
      context:
        'Transformers receive their data explicitly; keep {{name}} at the owning context boundary. Memoization with useMemo/useCallback remains valid. [helpers-categories]',
      jsx: 'Helpers return data, display text or visual configuration, never JSX or React elements. Use a component for rendering. [helpers-categories]',
      displayOnly:
        'Formatters produce display text; keep presenter and UI-library dependencies at the visual boundary. Runtime dependency: {{chain}}. [helpers-formatter-hooks]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (!isProductionSource(filename) || /\.d\.[cm]?ts$/u.test(filename))
      return {}
    if (!/(?:^|\/)src\//u.test(filename)) return {}
    const category = helperCategory(filename)
    if (!category) return {}
    const canonical = Object.hasOwn(HELPER_CATEGORIES, category)
    const sourceCode = context.sourceCode
    const dependencies = runtimeDependencies(context)
    const stem = basename(filename).replace(/\.[cm]?[jt]sx?$/u, '')
    function checkDependency(node, source) {
      if (!canonical || typeof source !== 'string') return
      if (category === 'formatters') {
        const visual = dependencies.trace(
          source,
          (specifier, target) =>
            helperCategory(target ?? specifier) === 'presenters' ||
            /^(?:recharts|react-dom|@radix-ui\/[^/]+)(?:\/|$)/u.test(
              specifier,
            ) ||
            /(?:^|\/)shared\/ui\//u.test(target ?? specifier),
        )
        if (visual)
          context.report({
            node,
            messageId: 'displayOnly',
            data: { chain: visual.chain.join(' → ') },
          })
      }
      const found = dependencies.trace(
        source,
        (specifier, target, _depth, importer) => {
          const roles = moduleRoles(target ?? specifier)
          return (
            (/^(?:yup|axios|ky|@tanstack\/react-query)(?:\/|$)/u.test(
              specifier,
            ) &&
              !errorOnlyDependency(specifier, importer)) ||
            /(?:^|\/)(?:apis|schemas|services)\//u.test(roles) ||
            (/(?:^|\/)stores\//u.test(roles) &&
              (category === 'transformers' ||
                /(?:^|\/)src\/domains\//u.test(target ?? '') ||
                specifier.startsWith('@/domains/'))) ||
            (category === 'transformers' &&
              /^(?:jotai|react-router|react-router-dom)(?:\/|$)/u.test(
                specifier,
              ))
          )
        },
      )
      if (found)
        context.report({
          node,
          messageId: 'dependency',
          data: { chain: found.chain.join(' → ') },
        })
    }
    function errorOnlyDependency(source, importer) {
      const allowed = ERROR_EXPORTS[source]
      if (!allowed) return false
      if (importer.replaceAll('\\', '/') === filename) {
        const edges = sourceCode.ast.body.filter(
          (node) =>
            node.source?.value === source &&
            !typeOnlyExport(node) &&
            !typeOnlyImport(node),
        )
        return (
          edges.length > 0 &&
          edges.every(
            (node) =>
              node.specifiers?.length > 0 &&
              node.specifiers.every(
                (specifier) =>
                  specifier.importKind === 'type' ||
                  specifier.exportKind === 'type' ||
                  allowed.has(
                    specifier.imported?.name ??
                      (specifier.type === 'ExportSpecifier'
                        ? specifier.local.name
                        : undefined),
                  ),
              ),
          )
        )
      }
      const file = sourceCode.parserServices?.program?.getSourceFile(importer)
      const edges = file?.statements.filter(
        (node) =>
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier?.text === source,
      )
      return Boolean(
        edges?.length &&
        edges.every((node) => {
          if (ts.isImportDeclaration(node)) {
            const clause = node.importClause
            if (clause?.isTypeOnly) return true
            return (
              !clause?.name &&
              clause?.namedBindings &&
              ts.isNamedImports(clause.namedBindings) &&
              clause.namedBindings.elements.every(
                (item) =>
                  item.isTypeOnly ||
                  allowed.has((item.propertyName ?? item.name).text),
              )
            )
          }
          return (
            node.isTypeOnly ||
            (node.exportClause &&
              ts.isNamedExports(node.exportClause) &&
              node.exportClause.elements.every(
                (item) =>
                  item.isTypeOnly ||
                  allowed.has((item.propertyName ?? item.name).text),
              ))
          )
        }),
      )
    }
    function checkElement(node) {
      if (canonical) context.report({ node, messageId: 'jsx' })
    }
    return {
      ImportDeclaration(node) {
        if (!typeOnlyImport(node)) checkDependency(node, node.source.value)
      },
      ExportNamedDeclaration(node) {
        if (!typeOnlyExport(node) && node.source)
          checkDependency(node, node.source.value)
      },
      ExportAllDeclaration(node) {
        if (!typeOnlyExport(node)) checkDependency(node, node.source.value)
      },
      ImportExpression(node) {
        checkDependency(node, staticModuleSource(node.source))
      },
      JSXElement: checkElement,
      JSXFragment: checkElement,
      CallExpression(node) {
        if (!canonical) return
        const react = libraryBinding(sourceCode, node.callee, 'react')
        const jotai = libraryBinding(sourceCode, node.callee, 'jotai')
        const navigation = ['react-router', 'react-router-dom'].some(
          (library) =>
            libraryBinding(sourceCode, node.callee, library) === 'useNavigate',
        )
        if (
          EFFECT_HOOKS.has(react) ||
          ['useAtom', 'useSetAtom'].includes(jotai) ||
          navigation
        )
          context.report({
            node,
            messageId: 'effect',
            data: { name: react ?? jotai ?? 'useNavigate' },
          })
        else if (
          category === 'transformers' &&
          ['useContext', 'use', 'useSyncExternalStore'].includes(react)
        )
          context.report({ node, messageId: 'context', data: { name: react } })
        if (
          react === 'createElement' ||
          ['react/jsx-runtime', 'react/jsx-dev-runtime'].some((library) =>
            ['jsx', 'jsxs', 'jsxDEV'].includes(
              libraryBinding(sourceCode, node.callee, library),
            ),
          )
        )
          checkElement(node)
      },
      'Program:exit'(program) {
        if (!canonical)
          context.report({
            node: program,
            messageId: 'category',
            data: { category },
          })
        if (stem.endsWith('.logic')) {
          context.report({ node: program, messageId: 'logic' })
          return
        }
        for (const entry of getPublicExports(program, context.sourceCode)) {
          const declaration = entry.declarations.find((node) =>
            isCallable(node, context.sourceCode),
          )
          if (!declaration) continue
          const name =
            entry.name === 'default' ? declaration.id?.name : entry.name
          if (name && name !== stem)
            context.report({
              node: entry.node,
              messageId: 'name',
              data: { name },
            })
        }
      },
    }
  },
}

const EFFECT_HOOKS = new Set([
  'useEffect',
  'useLayoutEffect',
  'useInsertionEffect',
  'useImperativeHandle',
  'useState',
  'useReducer',
  'useActionState',
  'useOptimistic',
  'useTransition',
])

// Error classification neither constructs schemas nor performs HTTP requests.
const ERROR_EXPORTS = {
  yup: new Set(['ValidationError']),
  axios: new Set(['isAxiosError', 'AxiosError', 'isCancel', 'CanceledError']),
}

function isCallable(node, sourceCode, seen = new Set()) {
  node = unwrap(node)
  if (!node || seen.has(node)) return false
  seen.add(node)
  if (
    [
      'FunctionDeclaration',
      'TSDeclareFunction',
      'FunctionExpression',
      'ArrowFunctionExpression',
    ].includes(node.type)
  )
    return true
  if (node.type === 'VariableDeclarator')
    return isCallable(node.init, sourceCode, seen)
  if (node.type !== 'Identifier') return false
  const initializer = stableInitializer(sourceCode, node)
  if (initializer) return isCallable(initializer, sourceCode, seen)
  const definition = findVariable(sourceCode, node)?.defs[0]
  return (
    definition?.type === 'FunctionName' &&
    isCallable(definition.node, sourceCode, seen)
  )
}
