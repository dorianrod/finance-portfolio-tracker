import {
  childrenOf,
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Preserve caller event handlers and refs when adapting shared UI props',
    },
    schema: [],
    messages: {
      overwritten:
        'Compose the caller {{name}} from this spread, or remove it explicitly from the public props. [ui-centralize-accessibility]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !/\/shared\/ui\//u.test(context.filename)
    )
      return {}
    const source = context.sourceCode
    const services = source.parserServices
    const checker = services.program.getTypeChecker()
    function forwards(input, variable, name, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'MemberExpression' &&
        findVariable(source, node.object) === variable &&
        (node.computed ? node.property.value : node.property.name) === name
      )
        return true
      if (
        node.type === 'Identifier' &&
        forwards(stableInitializer(source, node), variable, name, seen)
      )
        return true
      return childrenOf(source, node).some((child) =>
        forwards(child, variable, name, seen),
      )
    }
    return {
      JSXOpeningElement(node) {
        for (let index = 0; index < node.attributes.length; index++) {
          const attribute = node.attributes[index]
          const name = attribute.name?.name
          if (
            attribute.type !== 'JSXAttribute' ||
            !(name === 'ref' || /^on[A-Z]/u.test(name ?? ''))
          )
            continue
          for (const spread of node.attributes
            .slice(0, index)
            .filter((item) => item.type === 'JSXSpreadAttribute')) {
            const variable = findVariable(source, spread.argument)
            if (!variable) continue
            const type = checker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(spread.argument),
            )
            if (
              type.getProperty(name) &&
              !forwards(attribute.value?.expression, variable, name)
            ) {
              context.report({
                node: attribute,
                messageId: 'overwritten',
                data: { name },
              })
              break
            }
          }
        }
      },
    }
  },
}
