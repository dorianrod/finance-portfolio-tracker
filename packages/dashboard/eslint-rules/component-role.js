import path from 'node:path'

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

function componentRole(filename) {
  if (filename.endsWith('.view.tsx')) return 'view'
  if (filename.endsWith('.feature.tsx')) return 'feature'
  return null
}

function isExempt(filename) {
  const basename = path.basename(filename)
  return basename === 'main.tsx'
    || basename.endsWith('.test.tsx')
    || basename.endsWith('.spec.tsx')
}

function isTypeOnlyImport(node) {
  if (node.importKind === 'type') return true
  return node.specifiers.length > 0
    && node.specifiers.every((specifier) => specifier.importKind === 'type')
}

function isBusinessSource(source) {
  return BUSINESS_MODULES.some((module) => source === module || source.startsWith(`${module}/`))
    || BUSINESS_PATH_SEGMENTS.some((segment) => source.includes(segment))
}

function declarationIsTypeOnly(node) {
  return node.exportKind === 'type'
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit React component roles and enforce view import boundaries',
    },
    schema: [],
    messages: {
      missingRole: 'React component modules must end in .view.tsx or .feature.tsx.',
      viewImportsFeature: 'A view cannot import the feature module "{{source}}".',
      viewImportsBusiness: 'A view cannot import runtime business state or logic from "{{source}}".',
    },
  },
  create(context) {
    const filename = context.filename
    if (!filename.endsWith('.tsx') || isExempt(filename)) return {}

    const role = componentRole(filename)

    function inspectSource(node, sourceNode, typeOnly) {
      if (role !== 'view' || typeOnly) return

      const source = sourceNode?.value
      if (typeof source !== 'string') return

      if (source.includes('.feature')) {
        context.report({
          node: sourceNode,
          messageId: 'viewImportsFeature',
          data: { source },
        })
        return
      }

      if (isBusinessSource(source)) {
        context.report({
          node: sourceNode,
          messageId: 'viewImportsBusiness',
          data: { source },
        })
      }
    }

    return {
      Program(node) {
        if (!role) context.report({ node, messageId: 'missingRole' })
      },
      ImportDeclaration(node) {
        inspectSource(node, node.source, isTypeOnlyImport(node))
      },
      ExportAllDeclaration(node) {
        inspectSource(node, node.source, declarationIsTypeOnly(node))
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return
        const typeOnly = declarationIsTypeOnly(node)
          || (node.specifiers.length > 0
            && node.specifiers.every((specifier) => specifier.exportKind === 'type'))
        inspectSource(node, node.source, typeOnly)
      },
    }
  },
}
