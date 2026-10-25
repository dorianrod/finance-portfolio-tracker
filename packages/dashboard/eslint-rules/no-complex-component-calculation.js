import {
  getFunctionComponentName,
  getStaticPropertyName,
  isFunctionNode,
  isTestFile,
} from './react-component-utils.js'

const ARITHMETIC_OPERATORS = new Set(['+', '-', '*', '/', '%', '**'])

function isCalculation(node) {
  if (node.type === 'BinaryExpression')
    return ARITHMETIC_OPERATORS.has(node.operator)

  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Math' &&
    getStaticPropertyName(node.callee.property) !== 'random'
  )
}

function countOperations(node, sourceCode) {
  if (!node || isFunctionNode(node)) return 0

  let count = isCalculation(node) ? 1 : 0
  for (const key of sourceCode.visitorKeys[node.type] ?? []) {
    const child = node[key]
    if (Array.isArray(child)) {
      for (const entry of child) count += countOperations(entry, sourceCode)
    } else {
      count += countOperations(child, sourceCode)
    }
  }
  return count
}

function isInsideComponent(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (getFunctionComponentName(current)) return true
  }
  return false
}

function hasCalculationParent(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (
      isFunctionNode(current) ||
      current.type.endsWith('Statement') ||
      current.type === 'VariableDeclarator' ||
      current.type === 'JSXExpressionContainer'
    )
      return false
    if (isCalculation(current)) return true
  }
  return false
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Extract compound calculations from components into categorized helpers',
    },
    schema: [
      {
        type: 'object',
        properties: { maxOperations: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      extractCalculation:
        'Extract this compound calculation into an intent-named helper; UI geometry belongs in helpers/presenters, quantitative metrics in helpers/calculators. Passing the calculation to useMemo or a callback does not extract it. [architecture-extract-component-calculations]',
    },
  },
  create(context) {
    if (isTestFile(context.filename)) return {}

    const maxOperations = context.options[0]?.maxOperations ?? 2

    function inspect(node) {
      if (
        !isCalculation(node) ||
        hasCalculationParent(node) ||
        !isInsideComponent(node) ||
        countOperations(node, context.sourceCode) <= maxOperations
      )
        return

      context.report({ node, messageId: 'extractCalculation' })
    }

    return { BinaryExpression: inspect, CallExpression: inspect }
  },
}
