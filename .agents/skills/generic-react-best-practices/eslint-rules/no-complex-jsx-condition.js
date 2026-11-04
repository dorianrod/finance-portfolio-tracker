import { isTestFile } from './react-component-utils.js'

function unwrapExpression(node) {
  let current = node
  while (
    current?.type === 'ChainExpression' ||
    current?.type === 'TSAsExpression' ||
    current?.type === 'TSNonNullExpression' ||
    current?.type === 'TSTypeAssertion'
  ) {
    current = current.expression
  }
  return current
}

function containsJsx(node, sourceCode) {
  const current = unwrapExpression(node)
  if (!current) return false
  if (current.type === 'JSXElement' || current.type === 'JSXFragment')
    return true

  const visitorKeys = sourceCode.visitorKeys[current.type] ?? []
  return visitorKeys.some((key) => {
    const child = current[key]
    if (Array.isArray(child))
      return child.some((entry) => containsJsx(entry, sourceCode))
    return containsJsx(child, sourceCode)
  })
}

function countPredicateLeaves(node, sourceCode) {
  const current = unwrapExpression(node)
  if (!current || containsJsx(current, sourceCode)) {
    if (current?.type !== 'LogicalExpression') return 0
  }
  if (current.type === 'LogicalExpression') {
    return (
      countPredicateLeaves(current.left, sourceCode) +
      countPredicateLeaves(current.right, sourceCode)
    )
  }
  return containsJsx(current, sourceCode) ? 0 : 1
}

function findComplexRenderCondition(node, sourceCode) {
  const current = unwrapExpression(node)
  if (!current) return null

  if (current.type === 'ConditionalExpression') {
    if (
      (containsJsx(current.consequent, sourceCode) ||
        containsJsx(current.alternate, sourceCode)) &&
      unwrapExpression(current.test)?.type === 'LogicalExpression'
    ) {
      return current.test
    }
    return (
      findComplexRenderCondition(current.consequent, sourceCode) ??
      findComplexRenderCondition(current.alternate, sourceCode)
    )
  }

  if (
    current.type === 'LogicalExpression' &&
    containsJsx(current, sourceCode)
  ) {
    if (countPredicateLeaves(current, sourceCode) > 1) return current
    return (
      findComplexRenderCondition(current.left, sourceCode) ??
      findComplexRenderCondition(current.right, sourceCode)
    )
  }

  return null
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require compound JSX render conditions to use an intention-revealing name',
    },
    schema: [],
    messages: {
      nameCondition:
        'Extract this compound render condition into an intention-revealing boolean (for example, shouldShowDetails) or a pure business predicate. [ui-name-compound-render-conditions]',
    },
  },
  create(context) {
    if (isTestFile(context.filename)) return {}

    const sourceCode = context.sourceCode

    return {
      JSXExpressionContainer(node) {
        if (
          node.parent.type !== 'JSXElement' &&
          node.parent.type !== 'JSXFragment'
        )
          return

        const condition = findComplexRenderCondition(
          node.expression,
          sourceCode,
        )
        if (condition)
          context.report({ node: condition, messageId: 'nameCondition' })
      },
    }
  },
}
