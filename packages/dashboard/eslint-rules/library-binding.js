import { importedBinding, stableInitializer, unwrap } from './ast-bindings.js'

// Follow immutable aliases, while preserving lexical binding and shadowing.
export function libraryBinding(sourceCode, input, library, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  const binding = importedBinding(sourceCode, node)
  if (binding?.source === library) return binding.name
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
