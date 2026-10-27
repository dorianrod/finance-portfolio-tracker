import { isProductionSource, stableInitializer } from './ast-bindings.js'
import { createContextResolver } from './context-provenance.js'

const NUMERIC_HOOKS = new Set([
  'useFormatMoney',
  'useFormatNumber',
  'useFormatPercentage',
])
const NUMERIC_FORMATTERS = new Set([
  'formatMoney',
  'formatNumber',
  'formatPercentage',
])

function unwrap(node) {
  let current = node
  while (
    current?.type === 'ChainExpression' ||
    current?.type === 'TSAsExpression' ||
    current?.type === 'TSNonNullExpression' ||
    current?.type === 'TSSatisfiesExpression' ||
    current?.type === 'TSTypeAssertion'
  ) {
    current = current.expression
  }
  return current
}

function displayExpression(node) {
  const value = unwrap(node)
  if (value?.type === 'JSXExpressionContainer')
    return displayExpression(value.expression)
  if (value?.type !== 'JSXElement' && value?.type !== 'JSXFragment')
    return value
  const content = value.children.filter(
    (child) => child.type !== 'JSXText' || child.value.trim().length > 0,
  )
  return content.length === 1 ? displayExpression(content[0]) : value
}

function returnedValue(statement) {
  if (statement?.type === 'ReturnStatement') return statement.argument
  if (statement?.type === 'BlockStatement' && statement.body.length === 1)
    return returnedValue(statement.body[0])
  return null
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Keep numeric display fallbacks in the existing formatter options',
    },
    schema: [],
    messages: {
      formatterFallback:
        'Pass the value directly to the existing formatter and configure fallback or zeroAsFallback there instead of wrapping formatting in a value guard. [helpers-formatter-hooks]',
      inputFallback:
        'Pass the nullable value directly and configure the existing formatter fallback option instead of defaulting its input inline. [helpers-formatter-hooks]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      /(?:^|\/)shared\/helpers\/formatters\//u.test(context.filename)
    )
      return {}

    const sourceCode = context.sourceCode
    const { hook: importedHook } = createContextResolver(
      sourceCode,
      context.filename,
    )

    function findVariable(identifier) {
      if (identifier?.type !== 'Identifier') return null
      let scope = sourceCode.getScope(identifier)
      while (scope) {
        const variable = scope.set.get(identifier.name)
        if (variable) return variable
        scope = scope.upper
      }
      return null
    }

    function isFormatter(node, seen = new Set()) {
      const variable = findVariable(unwrap(node))
      if (!variable || seen.has(variable)) return false
      seen.add(variable)
      if (
        variable.references.some(
          (reference) => reference.isWrite() && !reference.init,
        )
      )
        return false
      const definition = variable.defs[0]
      if (definition?.type !== 'Variable') return false
      const { id, init } = definition.node
      const initialValue = unwrap(init)
      if (id.type === 'Identifier' && initialValue?.type === 'Identifier')
        return isFormatter(initialValue, seen)
      if (initialValue?.type !== 'CallExpression') return false
      const hook = importedHook(initialValue.callee)
      if (id.type === 'Identifier') return NUMERIC_HOOKS.has(hook)
      if (
        id.type !== 'ObjectPattern' ||
        !/^use\w*Formatters$/u.test(hook ?? '')
      )
        return false
      return id.properties.some(
        (property) =>
          property.type === 'Property' &&
          !property.computed &&
          NUMERIC_FORMATTERS.has(property.key.name) &&
          property.value.type === 'Identifier' &&
          findVariable(property.value) === variable,
      )
    }

    function isFormatterCall(node) {
      const expression = displayExpression(node)
      return (
        expression?.type === 'CallExpression' && isFormatter(expression.callee)
      )
    }

    function sameValue(leftNode, rightNode) {
      const left = unwrap(leftNode)
      const right = unwrap(rightNode)
      if (!left || !right || left.type !== right.type) return false
      if (left.type === 'Identifier')
        return (
          left.name === right.name && findVariable(left) === findVariable(right)
        )
      if (left.type === 'MemberExpression')
        return (
          left.computed === right.computed &&
          left.optional === right.optional &&
          sameValue(left.object, right.object) &&
          (left.computed
            ? left.property.type === 'Literal' &&
              right.property.type === 'Literal' &&
              left.property.value === right.property.value
            : left.property.name === right.property.name)
        )
      return false
    }

    function isEmptyLiteral(node) {
      const value = unwrap(node)
      return (
        (value?.type === 'Literal' &&
          (value.value === null || value.value === 0)) ||
        (value?.type === 'Identifier' &&
          value.name === 'undefined' &&
          !findVariable(value)?.defs.length)
      )
    }

    function guardsValue(test, value, seen = new Set()) {
      const condition = unwrap(test)
      if (!condition || seen.has(condition)) return false
      seen.add(condition)
      if (condition.type === 'Identifier' && !sameValue(condition, value)) {
        return guardsValue(
          stableInitializer(sourceCode, condition),
          value,
          seen,
        )
      }
      if (
        condition.type === 'LogicalExpression' &&
        ['&&', '||'].includes(condition.operator)
      ) {
        return (
          guardsValue(condition.left, value, seen) ||
          guardsValue(condition.right, value, seen)
        )
      }
      if (sameValue(condition, value)) return true
      if (condition?.type === 'UnaryExpression' && condition.operator === '!')
        return (
          sameValue(condition.argument, value) ||
          guardsValue(condition.argument, value, seen)
        )
      return (
        condition?.type === 'BinaryExpression' &&
        ['==', '===', '!=', '!=='].includes(condition.operator) &&
        ((sameValue(condition.left, value) &&
          isEmptyLiteral(condition.right)) ||
          (sameValue(condition.right, value) && isEmptyLiteral(condition.left)))
      )
    }

    function isTextFallback(node) {
      const value = displayExpression(node)
      return (
        (value?.type === 'Literal' && typeof value.value === 'string') ||
        value?.type === 'JSXText' ||
        value?.type === 'TemplateLiteral' ||
        (value?.type === 'Identifier' && !isEmptyLiteral(value)) ||
        (value?.type === 'CallExpression' &&
          !isFormatterCall(value) &&
          (value.callee.name === 't' || value.callee.property?.name === 't'))
      )
    }

    function checkGuard(node, consequent, alternate) {
      for (const [formatted, fallback] of [
        [consequent, alternate],
        [alternate, consequent],
      ]) {
        if (
          isFormatterCall(formatted) &&
          isTextFallback(fallback) &&
          guardsValue(node.test, displayExpression(formatted).arguments[0])
        ) {
          context.report({ node, messageId: 'formatterFallback' })
          return
        }
      }
    }

    return {
      ConditionalExpression(node) {
        checkGuard(node, node.consequent, node.alternate)
      },
      IfStatement(node) {
        let alternate = node.alternate
        if (!alternate && node.parent.type === 'BlockStatement') {
          const statements = node.parent.body
          alternate = statements
            .slice(statements.indexOf(node) + 1)
            .find((statement) => statement.type !== 'EmptyStatement')
        }
        checkGuard(
          node,
          returnedValue(node.consequent),
          returnedValue(alternate),
        )
      },
      CallExpression(node) {
        if (!isFormatter(node.callee)) return
        const value = unwrap(node.arguments[0])
        if (
          value?.type === 'LogicalExpression' &&
          ['??', '||'].includes(value.operator) &&
          value.right.type === 'Literal' &&
          ['number', 'string'].includes(typeof value.right.value)
        )
          context.report({ node: value, messageId: 'inputFallback' })
      },
    }
  },
}
