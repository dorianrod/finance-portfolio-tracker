import {
  childrenOf,
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'
import { isFunctionNode } from './react-component-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep domain hook state exposed with its actions in scoped atoms',
    },
    schema: [],
    messages: {
      shared:
        'This domain hook exposes local state together with its write actions. Own the shared value in a scoped atom. [arch-no-prop-drilling]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !/\/domains\//u.test(context.filename)
    )
      return {}
    const source = context.sourceCode
    const states = []
    const returns = new Map()
    function owner(node) {
      let current = node.parent
      while (current && !isFunctionNode(current)) current = current.parent
      return current
    }
    function contains(input, variable, followAliases, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (node.type === 'Identifier') {
        if (findVariable(source, node) === variable) return true
        return (
          followAliases &&
          contains(stableInitializer(source, node), variable, true, seen)
        )
      }
      if (
        node.type === 'CallExpression' &&
        ['useMemo', 'useCallback'].includes(
          libraryBinding(source, node.callee, 'react'),
        )
      )
        return contains(node.arguments[0], variable, followAliases, seen)
      const children =
        node.type === 'Property' && !node.computed
          ? [node.value]
          : node.type === 'MemberExpression' && !node.computed
            ? [node.object]
            : childrenOf(source, node)
      return children.some((child) =>
        contains(child, variable, followAliases, seen),
      )
    }
    return {
      VariableDeclarator(node) {
        const init = unwrap(node.init)
        if (
          node.id.type !== 'ArrayPattern' ||
          init?.type !== 'CallExpression' ||
          libraryBinding(source, init.callee, 'react') !== 'useState'
        )
          return
        const hook = owner(node)
        const name = hook?.id?.name ?? hook?.parent.id?.name
        if (!/^use[A-Z]/u.test(name ?? '')) return
        const value = findVariable(source, node.id.elements[0])
        const setter = findVariable(source, node.id.elements[1])
        if (value && setter) states.push({ node, hook, value, setter })
      },
      ReturnStatement(node) {
        const hook = owner(node)
        const values = returns.get(hook) ?? []
        values.push(node.argument)
        returns.set(hook, values)
      },
      'Program:exit'() {
        for (const { node, hook, value, setter } of states) {
          const outputs =
            hook.type === 'ArrowFunctionExpression' &&
            hook.body.type !== 'BlockStatement'
              ? [hook.body]
              : (returns.get(hook) ?? [])
          if (
            outputs.some(
              (output) =>
                contains(output, value, false) &&
                contains(output, setter, true),
            )
          )
            context.report({ node, messageId: 'shared' })
        }
      },
    }
  },
}
