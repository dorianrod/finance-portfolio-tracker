import { childrenOf, stableInitializer } from './ast-bindings.js'
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

function countOperations(node, sourceCode, seen = new Set()) {
  if (!node || isFunctionNode(node) || seen.has(node)) return 0
  seen.add(node)
  if (node.type === 'Identifier') {
    const value = stableInitializer(sourceCode, node)
    return value && isInsideComponent(value, sourceCode)
      ? countOperations(value, sourceCode, seen)
      : 0
  }
  let children = childrenOf(sourceCode, node)
  if (node.type === 'MemberExpression') {
    const object = stableInitializer(sourceCode, node.object)
    if (object?.type === 'ObjectExpression') {
      const key =
        node.computed && node.property.type !== 'Literal'
          ? null
          : getStaticPropertyName(node.property)
      const property =
        key == null
          ? null
          : object.properties.find(
              (property) =>
                property.type === 'Property' &&
                !property.computed &&
                getStaticPropertyName(property.key) === key,
            )
      children = [
        property?.value,
        ...(node.computed ? [node.property] : []),
      ].filter(Boolean)
    } else children = [node.object, ...(node.computed ? [node.property] : [])]
  } else if (node.type === 'Property')
    children = [node.value, ...(node.computed ? [node.key] : [])]
  return (
    (isCalculation(node) ? 1 : 0) +
    children.reduce(
      (sum, child) => sum + countOperations(child, sourceCode, seen),
      0,
    )
  )
}

function isInsideComponent(node, sourceCode) {
  for (let current = node.parent; current; current = current.parent) {
    if (getFunctionComponentName(current, sourceCode)) return true
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
        'Extract this compound calculation into an intent-named helper; UI geometry belongs in helpers/presenters, quantitative metrics in helpers/calculators. Passing the calculation to useMemo or a callback does not extract it. [arch-thin-components]',
    },
  },
  create(context) {
    if (isTestFile(context.filename)) return {}

    const maxOperations = context.options[0]?.maxOperations ?? 2
    const candidates = new Set()

    function inspect(node) {
      if (
        !isCalculation(node) ||
        hasCalculationParent(node) ||
        !isInsideComponent(node, context.sourceCode) ||
        countOperations(node, context.sourceCode) <= maxOperations
      )
        return

      candidates.add(node)
    }

    return {
      BinaryExpression: inspect,
      CallExpression(node) {
        inspect(node)
        if (
          !isInsideComponent(node, context.sourceCode) ||
          node.callee.type !== 'MemberExpression' ||
          !['map', 'flatMap'].includes(
            getStaticPropertyName(node.callee.property),
          )
        )
          return
        const callback = node.arguments[0]
        if (!isFunctionNode(callback)) return
        const result =
          callback.body.type === 'BlockStatement'
            ? callback.body.body.find(
                (statement) => statement.type === 'ReturnStatement',
              )?.argument
            : callback.body
        if (
          result?.type === 'ObjectExpression' &&
          countOperations(result, context.sourceCode) > maxOperations
        )
          candidates.add(node)
      },
      JSXOpeningElement(node) {
        if (!isInsideComponent(node, context.sourceCode)) return
        const geometry = node.attributes.filter(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            ['x', 'y', 'cx', 'cy', 'width', 'height', 'r', 'rx', 'ry'].includes(
              attribute.name.name,
            ),
        )
        const seen = new Set()
        const operations = geometry.map((attribute) =>
          countOperations(attribute.value, context.sourceCode, seen),
        )
        if (
          operations.filter((count) => count > 0).length > 1 &&
          operations.reduce((sum, count) => sum + count, 0) > maxOperations
        )
          candidates.add(node)
      },
      'Program:exit'() {
        for (const node of candidates) {
          if (
            [...candidates].some(
              (parent) =>
                parent !== node &&
                parent.range[0] <= node.range[0] &&
                parent.range[1] >= node.range[1],
            )
          )
            continue
          context.report({ node, messageId: 'extractCalculation' })
        }
      },
    }
  },
}
