import {
  findVariable,
  importedBinding,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

export function createTranslationResolver(sourceCode) {
  function translationObject(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    const binding = importedBinding(sourceCode, node)
    if (
      binding &&
      (binding.source === 'i18next' ||
        /(?:^|\/)i18n(?:\.[cm]?[jt]s)?$/u.test(binding.source))
    )
      return true
    // Preserve support for the project's global-i18n snippets and ambient binding.
    if (
      node.type === 'Identifier' &&
      node.name === 'i18n' &&
      !findVariable(sourceCode, node)?.defs.length
    )
      return true
    return translationObject(stableInitializer(sourceCode, node), seen)
  }
  function translationFunction(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (
      node.type === 'MemberExpression' &&
      (node.computed ? node.property.value : node.property.name) === 't'
    )
      return translationObject(node.object)
    const binding = importedBinding(sourceCode, node)
    if (binding?.source === 'i18next' && binding.name === 't') return true
    const definition = findVariable(sourceCode, node)?.defs[0]
    if (
      definition?.type === 'Variable' &&
      definition.node.id.type === 'ObjectPattern'
    ) {
      const property = definition.node.id.properties.find(
        (property) =>
          property.type === 'Property' && property.value === definition.name,
      )
      if (property?.key.name === 't') {
        const init = unwrap(definition.node.init)
        const hook =
          init?.type === 'CallExpression'
            ? importedBinding(sourceCode, init.callee)
            : null
        return (
          (hook?.name === 'useTranslation' &&
            hook.source === 'react-i18next') ||
          translationObject(init)
        )
      }
    }
    return translationFunction(stableInitializer(sourceCode, node), seen)
  }
  return (node) =>
    node?.type === 'CallExpression' && translationFunction(node.callee)
}
