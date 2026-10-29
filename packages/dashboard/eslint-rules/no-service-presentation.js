import { isProductionSource } from './ast-bindings.js'
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
        'Keep translation and display formatting out of domain services, calculations and aggregations',
    },
    schema: [],
    messages: {
      presentation:
        'Keep translation and display formatting in component/page presenters or formatters. Runtime dependency: {{chain}}. Return raw data and errors from domain services, calculations and aggregations. [arch-no-visual-logic-below-page]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const quantitativeHelper =
      /\/src\/domains\/.+\/helpers\/(?:calculators|aggregators)\//u.test(
        filename,
      )
    const reusableService =
      /\/src\/domains\/.+\/services\//u.test(filename) &&
      !/\/(?:components|pages|mocks)\//u.test(filename)
    if (
      !isProductionSource(filename) ||
      (!quantitativeHelper && !reusableService)
    )
      return {}
    const dependencies = runtimeDependencies(context)
    function check(node, source) {
      if (typeof source !== 'string') return
      const found = dependencies.trace(
        source,
        (specifier, target) =>
          specifier === 'i18next' ||
          specifier === 'react-i18next' ||
          /(?:^|\/)i18n(?:\/|$)/u.test(target ?? specifier) ||
          /(?:^|\/)helpers\/formatters(?:\/|$)/u.test(target ?? specifier),
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
