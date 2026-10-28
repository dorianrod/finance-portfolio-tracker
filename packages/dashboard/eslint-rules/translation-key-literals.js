export function translationKeyLiterals(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return [node]
  if (node?.type === 'ConditionalExpression') {
    const consequent = translationKeyLiterals(node.consequent)
    const alternate = translationKeyLiterals(node.alternate)
    return consequent && alternate ? [...consequent, ...alternate] : null
  }
  return null
}
