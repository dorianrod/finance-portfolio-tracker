import path from 'node:path'

import { isProductionSource } from './ast-bindings.js'
import {
  analyzeComponentRoles,
  businessSource,
} from './component-role-analysis.js'
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
        'Require explicit component roles, reject visual-only features and enforce runtime view boundaries',
    },
    schema: [],
    messages: {
      missingRole:
        'React component modules must end in .view.tsx, .state.tsx or .feature.tsx.',
      viewImportsFeature:
        'A view cannot import the feature module "{{source}}".',
      viewImportsState:
        'A view cannot import the state-rendering module "{{source}}".',
      viewImportsBusiness:
        'A view cannot import runtime business state or logic from "{{source}}".',
      featureWithoutBusiness:
        '{{name}} has only presentation, formatting or local UI state. Use a .view.tsx module; a feature must own business behavior or compose features/state renderers. [arch-component-roles]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (
      !filename.endsWith('.tsx') ||
      !isProductionSource(filename) ||
      path.basename(filename) === 'main.tsx'
    )
      return {}
    const role = /\.(view|state|feature)\.tsx$/u.exec(filename)?.[1]
    const dependencies = runtimeDependencies(context)
    const sharedUi = /(?:^|\/)src\/shared\/ui\//u.test(filename)
    function ownedUiBehavior(source, target) {
      return (
        sharedUi &&
        (source === 'jotai' ||
          source.startsWith('jotai/') ||
          /\/src\/shared\/ui\/(?:services|stores)\//u.test(target ?? ''))
      )
    }
    function inspectSource(sourceNode, typeOnly) {
      if (
        role !== 'view' ||
        typeOnly ||
        typeof staticModuleSource(sourceNode) !== 'string'
      )
        return
      const found = dependencies.trace(
        staticModuleSource(sourceNode),
        (source, target, depth) => {
          const resolved = target ?? source
          if (/\.feature(?:\.|$)/u.test(resolved)) return 'viewImportsFeature'
          if (/\.state(?:\.|$)/u.test(resolved)) return 'viewImportsState'
          if (ownedUiBehavior(source, target)) return null
          // Pure classification helpers inside formatters remain valid. Indirect
          // state, API and service dependencies still make a view stateful.
          const business =
            depth === 0
              ? businessSource(source) || businessSource(resolved)
              : ['jotai', '@tanstack/react-query'].some(
                  (module) =>
                    source === module || source.startsWith(`${module}/`),
                ) || /\/(?:apis|stores|services)\//u.test(resolved)
          return business ? 'viewImportsBusiness' : null
        },
        {
          stop: (target) =>
            /\.view\.tsx$/u.test(target) || /\/src\/shared\/ui\//u.test(target),
        },
      )
      if (found)
        context.report({
          node: sourceNode,
          messageId: found.match,
          data: { source: found.chain.join(' → ') },
        })
    }
    return {
      Program(node) {
        if (!role) context.report({ node, messageId: 'missingRole' })
      },
      ImportDeclaration(node) {
        inspectSource(node.source, typeOnlyImport(node))
      },
      ExportNamedDeclaration(node) {
        inspectSource(node.source, typeOnlyExport(node))
      },
      ExportAllDeclaration(node) {
        inspectSource(node.source, typeOnlyExport(node))
      },
      ImportExpression(node) {
        inspectSource(node.source, false)
      },
      'Program:exit'(node) {
        if (role !== 'feature') return
        for (const component of analyzeComponentRoles(context.sourceCode, node))
          if (
            (component.elements > 0 || component.forwardsChildren) &&
            component.business.size === 0 &&
            component.opaque.size === 0
          )
            context.report({
              node: component.node,
              messageId: 'featureWithoutBusiness',
              data: { name: component.name },
            })
      },
    }
  },
}
