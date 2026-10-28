import ts from 'typescript'

import {
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Render numeric text through shared formatter hooks',
    },
    schema: [],
    messages: {
      formatter:
        'Format this displayed number through a formatter hook. [helpers-formatter-hooks]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    if (!services?.program) return {}
    const checker = services.program.getTypeChecker()

    function isNumber(node) {
      if (!node) return false
      const type = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      )
      const parts = (type.isUnion() ? type.types : [type]).filter(
        (part) => !(part.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)),
      )
      return (
        parts.length > 0 &&
        parts.every((part) => part.flags & ts.TypeFlags.NumberLike)
      )
    }

    function isStringConstructor(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'Identifier' &&
        node.name === 'String' &&
        !findVariable(source, node)?.defs.length
      )
        return true
      return isStringConstructor(stableInitializer(source, node), seen)
    }

    function inspect(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return
      seen.add(node)
      if (isNumber(node)) {
        context.report({ node, messageId: 'formatter' })
        return
      }
      if (node.type === 'ConditionalExpression') {
        inspect(node.consequent, seen)
        inspect(node.alternate, seen)
      } else if (node.type === 'LogicalExpression') {
        if (node.operator !== '&&') inspect(node.left, seen)
        inspect(node.right, seen)
      } else if (node.type === 'TemplateLiteral') {
        for (const expression of node.expressions) inspect(expression, seen)
      } else if (node.type === 'CallExpression') {
        const callee = unwrap(node.callee)
        const stringConversion =
          isStringConstructor(callee) &&
          node.arguments.length === 1 &&
          isNumber(node.arguments[0])
        const numberMethod =
          callee.type === 'MemberExpression' &&
          (callee.computed ? callee.property.value : callee.property.name) ===
            'toString' &&
          isNumber(callee.object)
        if (stringConversion || numberMethod)
          context.report({ node, messageId: 'formatter' })
      } else {
        inspect(stableInitializer(source, node), seen)
      }
    }

    return {
      JSXExpressionContainer(node) {
        if (node.parent.type !== 'JSXAttribute') inspect(node.expression)
      },
    }
  },
}
