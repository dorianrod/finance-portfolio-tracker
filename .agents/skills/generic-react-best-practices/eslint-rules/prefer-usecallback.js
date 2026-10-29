import { isProductionSource } from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Memoize callable results with useCallback instead of useMemo',
    },
    schema: [],
    messages: {
      callback:
        'Use useCallback for a memoized function; reserve useMemo for data. [quality-usecallback-for-functions]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    const checker = services.program.getTypeChecker()
    return {
      CallExpression(node) {
        if (
          libraryBinding(source, node.callee, 'react') !== 'useMemo' ||
          !node.arguments[0]
        )
          return
        const callback = checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(node.arguments[0]),
        )
        const signatures = callback.getCallSignatures()
        if (
          signatures.length > 0 &&
          signatures.every((signature) => {
            const result = checker.getReturnTypeOfSignature(signature)
            const variants = result.isUnion() ? result.types : [result]
            return variants.every(
              (variant) => variant.getCallSignatures().length > 0,
            )
          })
        )
          context.report({ node, messageId: 'callback' })
      },
    }
  },
}
