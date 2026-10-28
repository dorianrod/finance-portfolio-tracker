import { isProductionSource } from './ast-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep translation and display formatting out of reusable domain services',
    },
    schema: [],
    messages: {
      presentation:
        'Keep translation and display formatting in component/page presenters or formatters. Return raw data and errors from reusable domain services. [arch-no-visual-logic-below-page]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (
      !isProductionSource(filename) ||
      !/\/src\/domains\/.+\/services\//u.test(filename) ||
      /\/(?:components|pages|mocks)\//u.test(filename)
    )
      return {}
    function check(node, source) {
      if (
        typeof source === 'string' &&
        (source === 'i18next' ||
          source === 'react-i18next' ||
          /(?:^|\/)i18n(?:\/|$)/u.test(source) ||
          /(?:^|\/)helpers\/formatters(?:\/|$)/u.test(source))
      )
        context.report({ node, messageId: 'presentation' })
    }
    return {
      ImportDeclaration(node) {
        if (
          node.importKind === 'type' ||
          (node.specifiers.length > 0 &&
            node.specifiers.every(
              (specifier) => specifier.importKind === 'type',
            ))
        )
          return
        check(node, node.source.value)
      },
      ExportNamedDeclaration(node) {
        if (
          node.exportKind !== 'type' &&
          node.source &&
          (node.specifiers.length === 0 ||
            node.specifiers.some(
              (specifier) => specifier.exportKind !== 'type',
            ))
        )
          check(node, node.source.value)
      },
      ExportAllDeclaration(node) {
        if (node.exportKind !== 'type') check(node, node.source.value)
      },
      ImportExpression(node) {
        check(node, node.source.value)
      },
    }
  },
}
