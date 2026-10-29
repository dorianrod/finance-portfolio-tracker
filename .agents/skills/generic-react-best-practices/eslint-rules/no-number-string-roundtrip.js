import ts from 'typescript'

import { findVariable, isProductionSource, unwrap } from './ast-bindings.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Avoid converting a known number to text and immediately back to a number',
    },
    schema: [],
    messages: {
      roundtrip:
        'Use the existing numeric value directly instead of Number(String(value)). [yup-last-coercion-barrier]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const services = context.sourceCode.parserServices
    const checker = services.program.getTypeChecker()
    function globalCall(node, name) {
      return (
        node?.type === 'CallExpression' &&
        node.arguments.length === 1 &&
        node.callee.type === 'Identifier' &&
        node.callee.name === name &&
        !findVariable(context.sourceCode, node.callee)?.defs.length
      )
    }
    return {
      CallExpression(node) {
        if (!globalCall(node, 'Number')) return
        const inner = unwrap(node.arguments[0])
        if (!globalCall(inner, 'String')) return
        const type = checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(inner.arguments[0]),
        )
        if (
          (type.isUnion() ? type.types : [type]).every(
            (part) => part.flags & ts.TypeFlags.NumberLike,
          )
        )
          context.report({ node, messageId: 'roundtrip' })
      },
    }
  },
}
