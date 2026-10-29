import {
  importedBinding,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { getPublicExports } from './get-public-exports.js'
import { libraryBinding } from './library-binding.js'
import { runtimeDependencies } from './runtime-dependencies.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Place memoized helper adapters in categorized helpers',
    },
    schema: [],
    messages: {
      helper:
        'This hook only memoizes a categorized helper. Place it in the owning helpers category; services own effects or orchestration. [arch-helpers-vs-services]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (
      !isProductionSource(filename) ||
      !/\/src\/domains\/.+\/services\//u.test(filename)
    )
      return {}
    const sourceCode = context.sourceCode
    const dependencies = runtimeDependencies(context)

    function helperBinding(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      const binding = importedBinding(sourceCode, node)
      if (binding) {
        const target = dependencies.resolveSource(binding.source, filename)
        return /\/helpers\/[^/]+\//u.test(target ?? binding.source)
      }
      if (node.type === 'MemberExpression')
        return (
          !node.computed &&
          importedBinding(sourceCode, node.object)?.name === '*' &&
          helperBinding(node.object, seen)
        )
      return helperBinding(stableInitializer(sourceCode, node), seen)
    }

    return {
      'Program:exit'(node) {
        for (const entry of getPublicExports(node, sourceCode)) {
          for (const declaration of entry.declarations) {
            const fn =
              declaration.type === 'VariableDeclarator'
                ? declaration.init
                : declaration
            if (
              !fn ||
              fn.async ||
              fn.generator ||
              !fn.params?.every(dataBinding) ||
              !/^use[A-Z]/u.test(fn.id?.name ?? entry.name ?? '')
            )
              continue
            const memo = unwrap(returnedExpression(fn.body))
            if (
              memo?.type !== 'CallExpression' ||
              libraryBinding(sourceCode, memo.callee, 'react') !== 'useMemo' ||
              memo.arguments.length !== 2 ||
              !dataOnly(memo.arguments[1])
            )
              continue
            const callback = unwrap(memo.arguments[0])
            if (
              !['ArrowFunctionExpression', 'FunctionExpression'].includes(
                callback?.type,
              ) ||
              callback.async ||
              callback.params.length > 0
            )
              continue
            const call = unwrap(returnedExpression(callback.body))
            if (
              call?.type === 'CallExpression' &&
              helperBinding(call.callee) &&
              call.arguments.every(dataOnly)
            )
              context.report({ node: declaration, messageId: 'helper' })
          }
        }
      },
    }
  },
}

function dataBinding(node) {
  switch (node.type) {
    case 'Identifier':
      return true
    case 'AssignmentPattern':
      return dataBinding(node.left) && dataOnly(node.right)
    case 'RestElement':
      return dataBinding(node.argument)
    case 'ArrayPattern':
      return node.elements.every((item) => item === null || dataBinding(item))
    case 'ObjectPattern':
      return node.properties.every((property) =>
        property.type === 'RestElement'
          ? dataBinding(property.argument)
          : (!property.computed || dataOnly(property.key)) &&
            dataBinding(property.value),
      )
    default:
      return false
  }
}

function returnedExpression(body) {
  if (body?.type !== 'BlockStatement') return body
  if (body.body.length === 1 && body.body[0].type === 'ReturnStatement')
    return body.body[0].argument
  return null
}

function dataOnly(input) {
  const node = unwrap(input)
  if (!node) return false
  switch (node.type) {
    case 'Identifier':
    case 'Literal':
      return true
    case 'MemberExpression':
      return (
        dataOnly(node.object) && (!node.computed || dataOnly(node.property))
      )
    case 'ArrayExpression':
      return node.elements.every(
        (element) => element === null || dataOnly(element),
      )
    case 'ObjectExpression':
      return node.properties.every(
        (property) =>
          property.type === 'Property' &&
          property.kind === 'init' &&
          !property.method &&
          (!property.computed || dataOnly(property.key)) &&
          dataOnly(property.value),
      )
    case 'UnaryExpression':
      return node.operator !== 'delete' && dataOnly(node.argument)
    case 'BinaryExpression':
    case 'LogicalExpression':
      return dataOnly(node.left) && dataOnly(node.right)
    case 'ConditionalExpression':
      return (
        dataOnly(node.test) &&
        dataOnly(node.consequent) &&
        dataOnly(node.alternate)
      )
    case 'TemplateLiteral':
      return node.expressions.every(dataOnly)
    default:
      return false
  }
}
