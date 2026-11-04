import {
  findVariable,
  importedBinding,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

// Follow immutable aliases, while preserving lexical binding and shadowing.
export function libraryBinding(sourceCode, input, library, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  const binding = importedBinding(sourceCode, node)
  if (binding?.source === library) return binding.name
  const variable = findVariable(sourceCode, node)
  const definition = variable?.defs[0]
  if (
    definition?.type === 'Variable' &&
    definition.node.id.type === 'ObjectPattern' &&
    !variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    )
  ) {
    const property = definition.node.id.properties.find(
      (item) =>
        item.type === 'Property' &&
        (item.value.type === 'Identifier'
          ? item.value.name
          : item.value.left?.name) === node.name,
    )
    const namespace = libraryBinding(
      sourceCode,
      definition.node.init,
      library,
      seen,
    )
    if (property && (namespace === '*' || namespace === 'default'))
      return property.computed
        ? property.key.value
        : (property.key.name ?? property.key.value)
  }
  if (node.type === 'MemberExpression') {
    const namespace = libraryBinding(sourceCode, node.object, library, seen)
    if (namespace === '*' || namespace === 'default')
      return node.computed ? node.property.value : node.property.name
  }
  return libraryBinding(
    sourceCode,
    stableInitializer(sourceCode, node),
    library,
    seen,
  )
}
