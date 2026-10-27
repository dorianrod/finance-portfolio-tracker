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
        'Reject next-state expressions that capture previous React or Jotai state',
    },
    schema: [],
    messages: {
      captured:
        'Use a functional update: this next value reads the state captured during rendering. [state-vercel-functional-updates]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const source = context.sourceCode
    // Type provenance also covers atom setters exposed by application action hooks.
    const services = source.parserServices
    const checker = services?.program?.getTypeChecker()
    function setterStateName(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return null
      seen.add(node)
      const init = stableInitializer(source, node)
      if (init) return setterStateName(init, seen)
      const definition = findVariable(source, node)?.defs[0]
      const property =
        definition?.node.id?.type === 'ObjectPattern'
          ? definition.node.id.properties.find(
              (item) =>
                item.type === 'Property' && item.value === definition.name,
            )
          : null
      const name =
        property?.key.name ??
        (node.type === 'MemberExpression'
          ? node.computed
            ? node.property.value
            : node.property.name
          : node.name)
      return /^set[A-Z]/u.test(name ?? '')
        ? name[3].toLowerCase() + name.slice(4)
        : null
    }
    function isTypedSetter(node) {
      if (!checker) return false
      const type = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      )
      return type.getCallSignatures().some((signature) => {
        const parameter = signature.parameters[0]
        if (!parameter) return false
        let input = checker.getTypeOfSymbolAtLocation(
          parameter,
          services.esTreeNodeToTSNodeMap.get(node),
        )
        // Jotai represents its setter arguments as a rest tuple.
        if (checker.isTupleType(input))
          input = checker.getTypeArguments(input)[0]
        if (!input) return false
        return (
          input.isUnion() &&
          input.types.some((part) =>
            part.getCallSignatures().some((updater) => {
              const value = updater.parameters[0]
              return (
                value &&
                checker.isTypeAssignableTo(
                  checker.getReturnTypeOfSignature(updater),
                  checker.getTypeOfSymbolAtLocation(
                    value,
                    services.esTreeNodeToTSNodeMap.get(node),
                  ),
                )
              )
            }),
          )
        )
      })
    }
    function stateOrigin(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return null
      seen.add(node)
      const definition = findVariable(source, node)?.defs[0]
      if (definition?.type === 'Variable') {
        const init = unwrap(definition.node.init)
        if (init?.type === 'CallExpression') {
          const react = libraryBinding(source, init.callee, 'react')
          const jotai = libraryBinding(source, init.callee, 'jotai')
          const pattern = definition.node.id
          if (
            pattern.type === 'ArrayPattern' &&
            (react === 'useState' || jotai === 'useAtom')
          )
            return {
              setter: pattern.elements[1] === definition.name,
              value: findVariable(source, pattern.elements[0]),
              atom: jotai ? init.arguments[0] : null,
            }
          if (jotai === 'useAtomValue' || jotai === 'useSetAtom')
            return {
              setter: jotai === 'useSetAtom',
              value: findVariable(source, node),
              atom: init.arguments[0],
            }
        }
      }
      return stateOrigin(stableInitializer(source, node), seen)
    }
    function referencesPrevious(node, origin, expectedName, seen = new Set()) {
      node = unwrap(node)
      if (!node || seen.has(node) || isFunctionNode(node)) return false
      seen.add(node)
      if (node.type === 'Identifier') {
        const state = stateOrigin(node)
        if (state && !state.setter) {
          if (origin?.atom && state.atom)
            return (
              (findVariable(source, origin.atom) &&
                findVariable(source, origin.atom) ===
                  findVariable(source, state.atom)) ||
              (origin.atom.type === 'Identifier' &&
                state.atom.type === 'Identifier' &&
                !findVariable(source, origin.atom) &&
                !findVariable(source, state.atom) &&
                origin.atom.name === state.atom.name)
            )
          if (origin) return state.value === origin.value
          // An action-hook setter must correspond to this named state;
          // copying a different atom is an independent assignment.
          return state.value?.name === expectedName
        }
        return referencesPrevious(
          stableInitializer(source, node),
          origin,
          expectedName,
          seen,
        )
      }
      const children =
        node.type === 'Property' && !node.computed
          ? [node.value]
          : node.type === 'MemberExpression' && !node.computed
            ? [node.object]
            : childrenOf(source, node)
      return children.some((child) =>
        referencesPrevious(child, origin, expectedName, seen),
      )
    }
    return {
      CallExpression(node) {
        const value = unwrap(node.arguments[0])
        if (!value || isFunctionNode(value)) return
        const origin = stateOrigin(node.callee)
        if (!(origin?.setter || isTypedSetter(node.callee))) return
        if (referencesPrevious(value, origin, setterStateName(node.callee)))
          context.report({ node, messageId: 'captured' })
      },
    }
  },
}
