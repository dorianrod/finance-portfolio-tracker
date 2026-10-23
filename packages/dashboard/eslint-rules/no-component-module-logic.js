import { isFunctionNode, isTestFile } from './react-component-utils.js'

const COMPONENT_MODULE_SUFFIXES = ['.feature.tsx', '.view.tsx']
const OPAQUE_LOGIC_MODULE_PATTERN = /\.logic(?:\.(?:test|spec))?\.tsx?$/u
const TYPESCRIPT_EXPRESSION_WRAPPERS = new Set([
  'TSAsExpression',
  'TSInstantiationExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

function isComponentModule(filename) {
  return COMPONENT_MODULE_SUFFIXES.some((suffix) => filename.endsWith(suffix))
}

function isProgramDeclaration(node) {
  let current = node.parent
  if (current?.type === 'VariableDeclaration') current = current.parent
  if (current?.type === 'ExportDefaultDeclaration'
    || current?.type === 'ExportNamedDeclaration') {
    current = current.parent
  }
  return current?.type === 'Program'
}

function unwrapExpression(node) {
  let current = node
  while (TYPESCRIPT_EXPRESSION_WRAPPERS.has(current?.type)) {
    current = current.expression
  }
  return current
}

function isPascalCase(name) {
  return /^[A-Z]/u.test(name)
}

function isHookName(name) {
  return /^use[A-Z0-9]/u.test(name)
}

function report(context, node, name) {
  context.report({
    node,
    messageId: isHookName(name) ? 'extractHook' : 'extractHelper',
    data: { name },
  })
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Keep module-level hooks and helpers out of React component modules',
    },
    schema: [],
    messages: {
      extractHook: 'Move custom hook "{{name}}" out of this component module: read-only hooks go to a categorized helper file; effects and orchestration go to services. [arch-component-module-boundaries]',
      extractHelper: 'Move module helper "{{name}}" out of this component module into a component-, page-, or domain-owned categorized helper file. [arch-component-module-boundaries]',
      renameLogicModule: 'Replace this opaque *.logic module with a categorized helper or service whose path states its responsibility. [arch-component-module-boundaries]',
    },
  },
  create(context) {
    const filename = context.filename
    if (OPAQUE_LOGIC_MODULE_PATTERN.test(filename)) {
      return {
        Program(node) {
          context.report({ node, messageId: 'renameLogicModule' })
        },
      }
    }
    if (isTestFile(filename)) return {}
    if (!isComponentModule(filename)) return {}

    return {
      FunctionDeclaration(node) {
        if (!isProgramDeclaration(node) || !node.id) return

        const name = node.id.name
        if (isPascalCase(name)) return
        report(context, node.id, name)
      },
      VariableDeclarator(node) {
        if (!isProgramDeclaration(node) || node.id.type !== 'Identifier') return

        const initializer = unwrapExpression(node.init)
        if (!isFunctionNode(initializer)) return

        const name = node.id.name
        if (isPascalCase(name)) return
        report(context, node.id, name)
      },
    }
  },
}
