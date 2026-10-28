import {
  isGlobal,
  isTestFile,
  memberName,
  resolveTestValue,
} from './test-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep test fixtures complete, typed and deterministic',
    },
    schema: [],
    messages: {
      cast: 'This fixture is not assignable to the asserted type. Use a complete typed factory or an explicit invalid-input contract. [test-mock-data]',
      clock:
        'Use a fixed date/seed in mock data instead of the live clock or Math.random(). [test-mock-data]',
    },
  },
  create(context) {
    const mocks = /[/\\]mocks[/\\]|\.mock\.[cm]?[jt]sx?$/u.test(
      context.filename,
    )
    if (!mocks && !isTestFile(context.filename)) return {}
    const source = context.sourceCode
    const services = source.parserServices
    function checkCast(node) {
      if (!services.program) return
      const value = resolveTestValue(source, node.expression)
      if (!['ObjectExpression', 'ArrayExpression'].includes(value?.type)) return
      if (
        node.typeAnnotation.type === 'TSTypeReference' &&
        node.typeAnnotation.typeName.name === 'const'
      )
        return
      const checker = services.program.getTypeChecker()
      const from = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(value),
      )
      const to = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node.typeAnnotation),
      )
      if (!checker.isTypeAssignableTo(from, to))
        context.report({ node, messageId: 'cast' })
    }
    return {
      TSAsExpression: checkCast,
      TSTypeAssertion: checkCast,
      NewExpression(node) {
        if (
          mocks &&
          node.arguments.length === 0 &&
          isGlobal(source, resolveTestValue(source, node.callee), 'Date')
        )
          context.report({ node, messageId: 'clock' })
      },
      CallExpression(node) {
        const callee = resolveTestValue(source, node.callee)
        const owner = resolveTestValue(source, callee?.object)
        if (
          mocks &&
          ((isGlobal(source, callee, 'Date') && node.arguments.length === 0) ||
            (memberName(callee) === 'now' && isGlobal(source, owner, 'Date')) ||
            (memberName(callee) === 'random' &&
              isGlobal(source, owner, 'Math')))
        )
          context.report({ node, messageId: 'clock' })
      },
    }
  },
}
