import { isProductionSource } from './ast-bindings.js'
import { createContextResolver } from './context-provenance.js'
import { getPublicExports } from './get-public-exports.js'
import { helperRole } from './helper-categories.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Read context inside helper hooks instead of passing it through helper APIs',
    },
    schema: [],
    messages: {
      context:
        'Do not pass a formatter, translation function or context client to a helper. Compose the dependency inside a helper hook; pass business data or already formatted text instead. [helpers-no-context-params]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const resolver = createContextResolver(context.sourceCode, context.filename)
    return {
      CallExpression(node) {
        if (!resolver.helperCall(node.callee)) return
        for (const argument of node.arguments) {
          if (resolver.contextValue(argument))
            context.report({ node: argument, messageId: 'context' })
        }
      },
      'Program:exit'(node) {
        if (!helperRole(context.filename)) return
        for (const entry of getPublicExports(node, context.sourceCode)) {
          for (const declaration of entry.declarations) {
            const fn =
              declaration.type === 'VariableDeclarator'
                ? declaration.init
                : declaration
            for (const parameter of fn?.params ?? []) {
              if (resolver.contextType(parameter.typeAnnotation))
                context.report({ node: parameter, messageId: 'context' })
            }
          }
        }
      },
    }
  },
}
