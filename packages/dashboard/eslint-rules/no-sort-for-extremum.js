import { isProductionSource, unwrap } from './ast-bindings.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid sorting an entire collection to select one extremum',
    },
    schema: [],
    messages: {
      extremum:
        'Select the minimum or maximum in one pass instead of sorting the entire collection for its first or last item. [helpers-vercel-indexed-lookups]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    function isSort(input) {
      const node = unwrap(input)
      return (
        node?.type === 'CallExpression' &&
        node.arguments.length === 1 &&
        node.callee.type === 'MemberExpression' &&
        (node.callee.computed
          ? node.callee.property.value
          : node.callee.property.name) === 'toSorted'
      )
    }
    return {
      MemberExpression(node) {
        if (
          node.computed &&
          node.property.type === 'Literal' &&
          node.property.value === 0 &&
          isSort(node.object)
        )
          context.report({ node, messageId: 'extremum' })
      },
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          (node.callee.computed
            ? node.callee.property.value
            : node.callee.property.name) !== 'at' ||
          !isSort(node.callee.object) ||
          node.arguments.length !== 1
        )
          return
        const index = node.arguments[0]
        if (
          (index.type === 'Literal' && index.value === 0) ||
          (index.type === 'UnaryExpression' &&
            index.operator === '-' &&
            index.argument.value === 1)
        )
          context.report({ node, messageId: 'extremum' })
      },
    }
  },
}
