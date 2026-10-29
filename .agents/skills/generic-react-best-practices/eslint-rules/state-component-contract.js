import { getHookName } from './hook-name.js'
import { isTestFile } from './react-component-utils.js'

const BUSINESS_MODULES = ['jotai', '@tanstack/react-query']
const BUSINESS_PATH_SEGMENTS = [
  '/apis/',
  '/services/',
  '/stores/',
  '/helpers/businessRules/',
  '/helpers/calculators/',
  '/helpers/filters/',
  '/helpers/mappers/',
  '/helpers/quality/',
  '/helpers/validators/',
]

function isStateComponentModule(filename) {
  return filename.endsWith('.state.tsx')
}

function isTypeOnlyImport(node) {
  if (node.importKind === 'type') return true
  return (
    node.specifiers.length > 0 &&
    node.specifiers.every((specifier) => specifier.importKind === 'type')
  )
}

function isBusinessSource(source) {
  return (
    BUSINESS_MODULES.some(
      (module) => source === module || source.startsWith(`${module}/`),
    ) || BUSINESS_PATH_SEGMENTS.some((segment) => source.includes(segment))
  )
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep state-rendering components declarative and independent from business state sources',
    },
    schema: [],
    messages: {
      stateImportsBusiness:
        'A state-rendering component receives a resolved state and cannot import runtime business state or logic from "{{source}}". [arch-component-roles]',
      stateUsesHook:
        'A state-rendering component cannot call hook "{{name}}"; resolve state and behavior in its owning feature. [arch-component-roles]',
    },
  },
  create(context) {
    if (
      isTestFile(context.filename) ||
      !isStateComponentModule(context.filename)
    )
      return {}

    function inspectSource(node, sourceNode, typeOnly) {
      if (typeOnly) return
      const source = sourceNode?.value
      if (typeof source !== 'string' || !isBusinessSource(source)) return
      context.report({
        node,
        messageId: 'stateImportsBusiness',
        data: { source },
      })
    }

    return {
      ImportDeclaration(node) {
        inspectSource(node, node.source, isTypeOnlyImport(node))
      },
      ExportAllDeclaration(node) {
        inspectSource(node, node.source, node.exportKind === 'type')
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return
        const typeOnly =
          node.exportKind === 'type' ||
          (node.specifiers.length > 0 &&
            node.specifiers.every(
              (specifier) => specifier.exportKind === 'type',
            ))
        inspectSource(node, node.source, typeOnly)
      },
      CallExpression(node) {
        const name = getHookName(context.sourceCode, node.callee)
        if (!name) return
        context.report({
          node,
          messageId: 'stateUsesHook',
          data: { name },
        })
      },
    }
  },
}
