import ts from 'typescript'

import {
  childrenOf,
  findVariable,
  isProductionSource,
  unwrap,
} from './ast-bindings.js'
import { isFunctionNode } from './react-component-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep invalid boolean input distinguishable during Yup transformations',
    },
    schema: [],
    messages: {
      lossy:
        'This boolean transform collapses every unrecognized input to true or false. Preserve invalid input for Yup validation and recognize both boolean values explicitly. [yup-last-coercion-barrier]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    const checker = services.program.getTypeChecker()
    function returns(node) {
      if (node.type === 'ReturnStatement')
        return node.argument ? [unwrap(node.argument)] : []
      if (isFunctionNode(node)) return []
      return childrenOf(source, node).flatMap(returns)
    }
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          (node.callee.computed
            ? node.callee.property.value
            : node.callee.property.name) !== 'transform'
        )
          return
        const target = checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(node.callee.object),
        )
        // Use the actual schema type; other libraries may also expose transform().
        if (target.symbol?.name !== 'BooleanSchema') return
        const callback = unwrap(node.arguments[0])
        if (!isFunctionNode(callback) || callback.params.length < 2) return
        const original = findVariable(source, callback.params[1])
        if (!original?.references.some((reference) => reference.isRead()))
          return
        const outputs =
          callback.body.type === 'BlockStatement'
            ? returns(callback.body)
            : [unwrap(callback.body)]
        if (
          outputs.length &&
          outputs.every(
            (output) =>
              checker.getTypeAtLocation(
                services.esTreeNodeToTSNodeMap.get(output),
              ).flags & ts.TypeFlags.BooleanLike,
          )
        )
          context.report({ node, messageId: 'lossy' })
      },
    }
  },
}
