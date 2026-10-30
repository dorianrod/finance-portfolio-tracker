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
      factory:
        'Move this complete domain fixture factory to its owning mocks module. Keep case-specific overrides in the test. [test-mock-data]',
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
    function checkFactory(node) {
      if (
        mocks ||
        !services.program ||
        !node.returnType ||
        !node.body ||
        node.params.length > 1
      )
        return
      const statements =
        node.body.type === 'BlockStatement' ? node.body.body : null
      const returned = statements
        ? statements.length === 1 &&
          statements[0].type === 'ReturnStatement' &&
          statements[0].argument
        : node.body
      if (returned?.type !== 'ObjectExpression') return
      const parameter =
        node.params[0]?.type === 'AssignmentPattern'
          ? node.params[0].left
          : node.params[0]
      if (parameter && parameter.type !== 'Identifier') return
      const keys = new Set()
      for (const [index, property] of returned.properties.entries()) {
        if (property.type === 'SpreadElement') {
          if (
            index !== returned.properties.length - 1 ||
            property.argument.type !== 'Identifier' ||
            property.argument.name !== parameter?.name
          )
            return
        } else if (
          property.type === 'Property' &&
          !property.computed &&
          property.kind === 'init'
        ) {
          keys.add(property.key.name ?? String(property.key.value))
        } else return
      }
      const checker = services.program.getTypeChecker()
      const annotation = services.esTreeNodeToTSNodeMap.get(
        node.returnType.typeAnnotation,
      )
      if (!ts.isTypeReferenceNode(annotation)) return
      let symbol = checker.getSymbolAtLocation(annotation.typeName)
      if (symbol?.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol)
      if (
        !symbol?.declarations?.some((declaration) =>
          /[/\\]src[/\\]domains[/\\].*[/\\]types[/\\][^/\\]+\.type\.ts$/u.test(
            declaration.getSourceFile().fileName,
          ),
        )
      )
        return
      const type = checker.getTypeFromTypeNode(annotation)
      const actual = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(returned),
      )
      const variants = type.isUnion() ? type.types : [type]
      const complete = variants.some((variant) => {
        const fields = checker.getPropertiesOfType(variant)
        return (
          fields.length > 0 &&
          checker.isTypeAssignableTo(actual, variant) &&
          fields.every(
            (field) =>
              field.flags & ts.SymbolFlags.Optional || keys.has(field.name),
          )
        )
      })
      if (!complete) return
      if (parameter) {
        const fields = checker.getPropertiesOfType(
          checker.getTypeAtLocation(
            services.esTreeNodeToTSNodeMap.get(parameter),
          ),
        )
        if (
          !fields.length ||
          fields.some(
            (field) =>
              !(field.flags & ts.SymbolFlags.Optional) ||
              !checker.getPropertyOfType(type, field.name),
          )
        )
          return
      }
      context.report({ node, messageId: 'factory' })
    }
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
      FunctionDeclaration: checkFactory,
      FunctionExpression: checkFactory,
      ArrowFunctionExpression: checkFactory,
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
import ts from 'typescript'
