import { childrenOf, isProductionSource } from './ast-bindings.js'
import {
  getFunctionComponentName,
  getStaticPropertyName,
  isFunctionNode,
} from './react-component-utils.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Extract collection accumulations and compound business predicates from components',
    },
    schema: [],
    messages: {
      pipeline:
        'Extract this accumulation or compound collection predicate into an intent-named helper (selectors, businessRules, aggregators or calculators). Keep the rendering map in the component. [arch-thin-components]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      /\/src\/shared\/ui\//u.test(context.filename)
    )
      return {}
    function insideComponent(node) {
      for (let parent = node.parent; parent; parent = parent.parent)
        if (getFunctionComponentName(parent)) return true
      return false
    }
    function compound(node) {
      if (!node) return false
      if (
        node.type === 'LogicalExpression' ||
        node.type === 'ConditionalExpression'
      )
        return true
      if (
        node.type === 'BinaryExpression' &&
        ['+', '-', '*', '/', '%', '**'].includes(node.operator)
      )
        return true
      return childrenOf(context.sourceCode, node).some(compound)
    }
    return {
      CallExpression(node) {
        if (!insideComponent(node) || node.callee.type !== 'MemberExpression')
          return
        const method = getStaticPropertyName(node.callee.property)
        const callback = node.arguments[0]
        if (!isFunctionNode(callback)) return
        if (
          ['reduce', 'reduceRight'].includes(method) ||
          (['filter', 'some', 'every', 'find', 'findIndex'].includes(method) &&
            compound(callback.body))
        )
          context.report({ node, messageId: 'pipeline' })
      },
    }
  },
}
