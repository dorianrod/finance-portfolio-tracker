import ts from 'typescript'

import { isProductionSource, unwrap } from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'
import {
  getFunctionComponentName,
  isFunctionNode,
} from './react-component-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep raw Jotai atoms stable, explicitly typed and initialized from named collection defaults',
    },
    schema: [],
    messages: {
      render:
        'Declare atoms at module scope; use a stable per-instance memo only for an intentionally instance-owned atom. [state-module-level-atoms]',
      generic:
        'Give this raw atom an explicit type parameter. [state-explicit-types-defaults]',
      default:
        'Give this non-trivial atom default a named, typed DEFAULT_* constant. [state-explicit-types-defaults]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    const checker = services?.program?.getTypeChecker()
    function stableInstanceMemo(node) {
      let current = node
      while (current.parent) {
        const parent = current.parent
        // A memoized factory does not stabilize atoms created by later calls.
        if (isFunctionNode(current)) {
          return (
            parent.type === 'CallExpression' &&
            libraryBinding(source, parent.callee, 'react') === 'useMemo' &&
            parent.arguments[0] === current &&
            parent.arguments[1]?.type === 'ArrayExpression' &&
            parent.arguments[1].elements.length === 0
          )
        }
        current = parent
      }
      return false
    }
    function hasRenderOwner(node) {
      for (let current = node.parent; current; current = current.parent) {
        if (!isFunctionNode(current)) continue
        const name = current.id?.name ?? current.parent.id?.name
        if (
          getFunctionComponentName(current, source) ||
          /^use[A-Z]/u.test(name ?? '')
        )
          return true
      }
      return false
    }
    function isObjectDefault(node) {
      if (
        ['ObjectExpression', 'ArrayExpression', 'NewExpression'].includes(
          node.type,
        )
      )
        return true
      if (node.type !== 'CallExpression' || !checker) return false
      const native = services.esTreeNodeToTSNodeMap.get(node)
      const type = checker.getTypeAtLocation(native)
      return (type.isUnion() ? type.types : [type]).some(
        (part) => part.flags & ts.TypeFlags.Object,
      )
    }
    return {
      CallExpression(node) {
        const name =
          libraryBinding(source, node.callee, 'jotai') ??
          libraryBinding(source, node.callee, 'jotai/utils')
        if (name !== 'atom' && name !== 'atomWithStorage') return
        if (hasRenderOwner(node) && !stableInstanceMemo(node))
          context.report({ node, messageId: 'render' })
        const value = unwrap(node.arguments[name === 'atomWithStorage' ? 1 : 0])
        if (!value) return
        const native = services?.esTreeNodeToTSNodeMap?.get(value)
        const type = native && checker?.getTypeAtLocation(native)
        if (
          name === 'atom' &&
          (isFunctionNode(value) || type?.getCallSignatures().length)
        )
          return
        const plainBoolean =
          (value.type === 'Literal' && typeof value.value === 'boolean') ||
          (type &&
            (type.isUnion() ? type.types : [type]).every(
              (part) => part.flags & ts.TypeFlags.BooleanLike,
            ))
        if (!node.typeArguments?.params.length && !plainBoolean)
          context.report({ node, messageId: 'generic' })
        if (isObjectDefault(value))
          context.report({ node: value, messageId: 'default' })
      },
    }
  },
}
