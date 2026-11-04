import {
  childrenOf,
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import {
  analyzeEventComposition,
  isCancelableHandler,
} from './ui-event-composition.js'

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
      callerFirst:
        'Invoke the caller {{name}} before built-in activation or other work. [ui-centralize-accessibility]',
      cancellation:
        'Honor event.defaultPrevented after caller {{name}} and before built-in work. [ui-centralize-accessibility]',
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
    function rootBinding(node, seen = new Set()) {
      node = unwrap(node)
      if (!node || seen.has(node)) return null
      seen.add(node)
      const variable = findVariable(source, node)
      const initializer = unwrap(stableInitializer(source, node))
      return initializer?.type === 'Identifier'
        ? rootBinding(initializer, seen)
        : variable
    }
    function keyOf(node) {
      let key = node.property ?? node.key
      if (!node.computed) return key.name ?? key.value
      const seen = new Set()
      while (key?.type === 'Identifier' && !seen.has(key)) {
        seen.add(key)
        key = unwrap(stableInitializer(source, key))
      }
      return key?.type === 'Literal' ? key.value : null
    }
    function forwards(input, variable, name, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'MemberExpression' &&
        findVariable(source, node.object) === variable &&
        keyOf(node) === name
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
          const input = attribute.value?.expression
          const cancelable =
            name !== 'ref' && input && isCancelableHandler(context, input)
          const callers = []
          for (const spread of node.attributes
            .slice(0, index)
            .filter((item) => item.type === 'JSXSpreadAttribute')) {
            const variable = findVariable(source, spread.argument)
            if (!variable) continue
            const type = checker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(spread.argument),
            )
            if (type.getProperty(name))
              callers.push({
                variable,
                name,
                root: rootBinding(spread.argument),
              })
          }
          if (cancelable) {
            let owner = node.parent
            while (
              owner &&
              ![
                'FunctionDeclaration',
                'FunctionExpression',
                'ArrowFunctionExpression',
              ].includes(owner.type)
            )
              owner = owner.parent
            for (const parameter of owner?.params ?? []) {
              if (parameter.type !== 'ObjectPattern') continue
              const property = parameter.properties.find(
                (entry) => entry.type === 'Property' && keyOf(entry) === name,
              )
              const binding =
                property?.value.type === 'AssignmentPattern'
                  ? property.value.left
                  : property?.value
              if (binding?.type === 'Identifier')
                callers.push({
                  variable: findVariable(source, binding),
                  name: null,
                })
            }
          }
          for (const caller of callers) {
            if (name === 'ref') {
              if (forwards(input, caller.variable, name)) continue
              context.report({
                node: attribute,
                messageId: 'overwritten',
                data: { name },
              })
              break
            }
            function matchesCaller(input) {
              const reference = unwrap(input)
              if (!reference) return false
              if (caller.name === null)
                return (
                  reference.type === 'Identifier' &&
                  rootBinding(reference) === caller.variable
                )
              return (
                reference.type === 'MemberExpression' &&
                rootBinding(reference.object) === caller.root &&
                keyOf(reference) === caller.name
              )
            }
            const analysis = analyzeEventComposition(
              context,
              input,
              matchesCaller,
              cancelable,
            )
            let messageId = null
            if (!analysis.preserved) messageId = 'overwritten'
            else if (analysis.order) messageId = 'callerFirst'
            else if (analysis.cancellation) messageId = 'cancellation'
            if (messageId) {
              context.report({
                node: attribute,
                messageId,
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
