import {
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Consume TanStack data and mutations through named business aliases',
    },
    schema: [],
    messages: {
      member:
        'Destructure {{property}} with a business name before consuming it. [api-business-destructuring]',
      alias:
        'Give {{property}} a distinct business identifier alias. [api-business-destructuring]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    if (!services.program)
      throw new Error('api-business-destructuring requires typed linting.')
    const checker = services.program.getTypeChecker()
    function propertyName(node, seen = new Set()) {
      node = unwrap(node)
      if (!node || seen.has(node)) return null
      seen.add(node)
      if (node.type === 'Literal') return node.value
      return node.type === 'Identifier'
        ? propertyName(stableInitializer(source, node), seen)
        : null
    }
    function isTanStackField(node, name) {
      const typedNode = services.esTreeNodeToTSNodeMap.get(node)
      if (!typedNode) return false
      const type = checker.getNonNullableType(
        checker.getTypeAtLocation(typedNode),
      )
      const symbol = type.getProperty(name)
      return (
        symbol?.declarations?.some((declaration) =>
          /[/\\]node_modules[/\\]@tanstack[/\\](?:query-core|react-query)[/\\]/u.test(
            declaration.getSourceFile().fileName,
          ),
        ) ?? false
      )
    }
    return {
      MemberExpression(node) {
        const name = node.computed
          ? propertyName(node.property)
          : node.property.name
        if (
          ['data', 'mutateAsync'].includes(name) &&
          isTanStackField(node.object, name)
        )
          context.report({
            node,
            messageId: 'member',
            data: { property: name },
          })
      },
      ObjectPattern(node) {
        let input = node
        if (node.parent.type === 'VariableDeclarator') input = node.parent.init
        else if (node.parent.type === 'AssignmentExpression')
          input = node.parent.right
        for (const property of node.properties) {
          if (property.type !== 'Property') continue
          const name = property.computed
            ? propertyName(property.key)
            : (property.key.name ?? property.key.value)
          if (
            !['data', 'mutateAsync'].includes(name) ||
            !isTanStackField(input, name)
          )
            continue
          const value =
            property.value.type === 'AssignmentPattern'
              ? property.value.left
              : property.value
          if (value.type !== 'Identifier' || value.name === name)
            context.report({
              node: property,
              messageId: 'alias',
              data: { property: name },
            })
        }
      },
    }
  },
}
