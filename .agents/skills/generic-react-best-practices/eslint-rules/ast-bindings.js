export function unwrap(node) {
  while (
    node &&
    [
      'ChainExpression',
      'TSAsExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
      'TSTypeAssertion',
      'TSInstantiationExpression',
    ].includes(node.type)
  )
    node = node.expression
  return node
}

export function findVariable(sourceCode, node) {
  node = unwrap(node)
  if (node?.type !== 'Identifier') return null
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(node.name)
    if (variable) return variable
  }
  return null
}

export function stableInitializer(sourceCode, node) {
  const variable = findVariable(sourceCode, node)
  if (
    !variable ||
    variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    )
  )
    return null
  const definition = variable.defs[0]
  return definition?.type === 'Variable' &&
    definition.node.id.type === 'Identifier'
    ? definition.node.init
    : null
}

export function importedBinding(sourceCode, node) {
  const definition = findVariable(sourceCode, node)?.defs[0]
  if (definition?.type !== 'ImportBinding') return null
  return {
    name:
      definition.node.imported?.name ??
      definition.node.imported?.value ??
      (definition.node.type === 'ImportDefaultSpecifier' ? 'default' : '*'),
    source: definition.parent.source.value,
  }
}

export function childrenOf(sourceCode, node) {
  return (sourceCode.visitorKeys[node?.type] ?? []).flatMap((key) =>
    Array.isArray(node[key])
      ? node[key].filter(Boolean)
      : node[key]
        ? [node[key]]
        : [],
  )
}

export function isProductionSource(filename) {
  return (
    !/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/u.test(filename) &&
    !/\/(?:__tests__|storybook)\//u.test(filename)
  )
}
