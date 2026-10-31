import { dirname, resolve } from 'node:path'

import {
  importedBinding,
  isProductionSource,
  stableInitializer,
} from './ast-bindings.js'
import { createContextResolver } from './context-provenance.js'
import { helperCategory } from './helper-categories.js'

const FORMATTER_NAME = /^format[A-Z]\w*$/u
const FORMATTER_HOOK = /^useFormat[A-Z]\w*$/u
const FORMATTER_BUNDLE = /^use\w*Formatters$/u

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
      description: 'Keep display fallbacks in the existing formatter options',
    },
    schema: [],
    messages: {
      formatterFallback:
        'Pass the value directly to the existing formatter and configure its fallback options instead of wrapping formatting in a value guard. [helpers-formatter-hooks]',
      inputFallback:
        'Pass the nullable value directly and configure the existing formatter fallback option instead of defaulting its input inline. [helpers-formatter-hooks]',
      outputFallback:
        'Configure the existing formatter fallback option instead of replacing its formatted result inline. [helpers-formatter-hooks]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      /(?:^|\/)src\/shared\/helpers\/formatters\//u.test(context.filename)
    )
      return {}

    const sourceCode = context.sourceCode
    const { hook: importedHook } = createContextResolver(
      sourceCode,
      context.filename,
    )

    function isFormatterSource(source) {
      const target = source.startsWith('.')
        ? resolve(dirname(context.filename), source)
        : source
      return helperCategory(target) === 'formatters'
    }

    function propertyName(node) {
      return node.computed ? node.property.value : node.property.name
    }

    function isFormatterBundle(node, seen = new Set()) {
      const value = unwrap(node)
      if (!value || seen.has(value)) return false
      seen.add(value)
      if (value.type === 'CallExpression')
        return FORMATTER_BUNDLE.test(importedHook(value.callee) ?? '')
      return isFormatterBundle(stableInitializer(sourceCode, value), seen)
    }

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
      const expression = unwrap(node)
      if (expression?.type === 'MemberExpression') {
        const name = propertyName(expression)
        if (!FORMATTER_NAME.test(name ?? '')) return false
        const namespace = importedBinding(sourceCode, expression.object)
        return (
          (namespace?.name === '*' && isFormatterSource(namespace.source)) ||
          isFormatterBundle(expression.object)
        )
      }
      const variable = findVariable(expression)
      if (!variable || seen.has(variable)) return false
      seen.add(variable)
      if (
        variable.references.some(
          (reference) => reference.isWrite() && !reference.init,
        )
      )
        return false
      const definition = variable.defs[0]
      if (definition?.type === 'ImportBinding') {
        const binding = importedBinding(sourceCode, expression)
        return (
          FORMATTER_NAME.test(binding.name) && isFormatterSource(binding.source)
        )
      }
      if (definition?.type !== 'Variable') return false
      const { id, init } = definition.node
      const initialValue = unwrap(init)
      if (
        id.type === 'Identifier' &&
        ['Identifier', 'MemberExpression'].includes(initialValue?.type)
      )
        return isFormatter(initialValue, seen)
      if (initialValue?.type !== 'CallExpression') return false
      const hook = importedHook(initialValue.callee)
      if (id.type === 'Identifier')
        return (
          FORMATTER_HOOK.test(hook ?? '') && !FORMATTER_BUNDLE.test(hook ?? '')
        )
      if (id.type !== 'ObjectPattern' || !FORMATTER_BUNDLE.test(hook ?? ''))
        return false
      return id.properties.some(
        (property) =>
          property.type === 'Property' &&
          !property.computed &&
          FORMATTER_NAME.test(property.key.name ?? property.key.value ?? '') &&
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

    function isFormattedResult(node, seen = new Set()) {
      const value = unwrap(node)
      if (!value || seen.has(value)) return false
      seen.add(value)
      if (value.type === 'CallExpression' && isFormatterCall(value)) return true
      return (
        value.type === 'Identifier' &&
        isFormattedResult(stableInitializer(sourceCode, value), seen)
      )
    }

    function isOutputTextFallback(node, seen = new Set()) {
      const value = displayExpression(node)
      if (!value || seen.has(value)) return false
      seen.add(value)
      if (value.type === 'Identifier')
        return isOutputTextFallback(stableInitializer(sourceCode, value), seen)
      return isTextFallback(value)
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
          sameValue(left.object, right.object) &&
          propertyName(left) !== undefined &&
          propertyName(left) === propertyName(right)
        )
      return false
    }

    function isEmptyLiteral(node) {
      const value = unwrap(node)
      return (
        (value?.type === 'Literal' &&
          (value.value === null || value.value === 0 || value.value === '')) ||
        (value?.type === 'UnaryExpression' &&
          value.operator === 'void' &&
          value.argument.type === 'Literal' &&
          value.argument.value === 0) ||
        (value?.type === 'Identifier' &&
          value.name === 'undefined' &&
          !findVariable(value)?.defs.length)
      )
    }

    function isUndefinedTypeCheck(node, expected, value) {
      const expression = unwrap(node)
      return (
        expression?.type === 'UnaryExpression' &&
        expression.operator === 'typeof' &&
        sameValue(expression.argument, value) &&
        expected?.type === 'Literal' &&
        expected.value === 'undefined'
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
      if (
        condition.type === 'CallExpression' &&
        condition.callee.type === 'Identifier' &&
        condition.callee.name === 'Boolean' &&
        !findVariable(condition.callee)?.defs.length &&
        condition.arguments.length === 1
      )
        return guardsValue(condition.arguments[0], value, seen)
      return (
        condition?.type === 'BinaryExpression' &&
        ['==', '===', '!=', '!=='].includes(condition.operator) &&
        ((sameValue(condition.left, value) &&
          isEmptyLiteral(condition.right)) ||
          (sameValue(condition.right, value) &&
            isEmptyLiteral(condition.left)) ||
          isUndefinedTypeCheck(condition.left, condition.right, value) ||
          isUndefinedTypeCheck(condition.right, condition.left, value))
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
      LogicalExpression(node) {
        if (
          ['||', '??'].includes(node.operator) &&
          isFormattedResult(node.left) &&
          isOutputTextFallback(node.right)
        ) {
          context.report({ node, messageId: 'outputFallback' })
          return
        }
        if (
          ['&&', '||'].includes(node.operator) &&
          unwrap(node.right)?.type === 'CallExpression' &&
          isFormatterCall(node.right) &&
          guardsValue(node.left, displayExpression(node.right).arguments[0])
        )
          context.report({ node, messageId: 'formatterFallback' })
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
