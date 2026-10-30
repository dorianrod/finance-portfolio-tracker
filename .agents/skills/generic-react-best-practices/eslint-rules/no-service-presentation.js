import { isProductionSource } from './ast-bindings.js'
import { helperRole } from './helper-categories.js'
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
        'Keep translation and display formatting out of transformers and reusable domain services',
    },
    schema: [],
    messages: {
      presentation:
        'Keep display dependencies in presenters or formatters. Runtime dependency: {{chain}}. Transformers and reusable domain services return UI-independent data and semantic reasons. [arch-no-visual-logic-below-page]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const transformer = helperRole(filename) === 'data'
    const reusableService =
      /\/src\/domains\/.+\/services\//u.test(filename) &&
      !/\/(?:components|pages|mocks)\//u.test(filename)
    if (!isProductionSource(filename) || (!transformer && !reusableService))
      return {}
    const dependencies = runtimeDependencies(context)
    function check(node, source) {
      if (typeof source !== 'string') return
      const found = dependencies.trace(
        source,
        (specifier, target) =>
          specifier === 'i18next' ||
          specifier === 'react-i18next' ||
          /(?:^|\/)i18n(?:[./]|$)/u.test(target ?? specifier) ||
          helperRole(target ?? specifier) === 'presentation' ||
          (transformer &&
            (/^(?:recharts|react-dom|@radix-ui\/[^/]+)(?:\/|$)/u.test(
              specifier,
            ) ||
              /(?:^|\/)shared\/ui\//u.test(target ?? specifier))),
        { stop: (target) => /\/(?:apis|schemas|stores)\//u.test(target) },
      )
      if (found)
        context.report({
          node,
          messageId: 'presentation',
          data: { chain: found.chain.join(' → ') },
        })
    }
    return {
      ImportDeclaration(node) {
        if (typeOnlyImport(node)) return
        check(node, staticModuleSource(node.source))
      },
      ExportNamedDeclaration(node) {
        if (!typeOnlyExport(node) && node.source)
          check(node, staticModuleSource(node.source))
      },
      ExportAllDeclaration(node) {
        if (!typeOnlyExport(node)) check(node, staticModuleSource(node.source))
      },
      ImportExpression(node) {
        check(node, staticModuleSource(node.source))
      },
    }
  },
}
