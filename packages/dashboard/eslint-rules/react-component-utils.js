import path from 'node:path'

const REACT_COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo'])

export function isFunctionNode(node) {
  return node?.type === 'FunctionDeclaration'
    || node?.type === 'FunctionExpression'
    || node?.type === 'ArrowFunctionExpression'
}

export function getStaticPropertyName(node) {
  if (node?.type === 'Identifier') return node.name
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

export function getCalleeName(node) {
  if (node?.type === 'Identifier') return node.name
  if (node?.type === 'MemberExpression' && !node.computed) {
    return getStaticPropertyName(node.property)
  }
  return null
}

function isPascalCase(name) {
  return typeof name === 'string' && /^[A-Z]/u.test(name)
}

function isComponentWrapper(node) {
  return node?.type === 'CallExpression'
    && REACT_COMPONENT_WRAPPERS.has(getCalleeName(node.callee))
}

export function getFunctionComponentName(node) {
  if (!isFunctionNode(node)) return null
  if (isPascalCase(node.id?.name)) return node.id.name

  let current = node
  while (isComponentWrapper(current.parent)
    && current.parent.arguments.includes(current)) {
    current = current.parent
  }

  if (current.parent?.type === 'VariableDeclarator'
    && current.parent.init === current
    && current.parent.id.type === 'Identifier'
    && isPascalCase(current.parent.id.name)) {
    return current.parent.id.name
  }

  if (current.parent?.type === 'AssignmentExpression'
    && current.parent.right === current
    && current.parent.left.type === 'Identifier'
    && isPascalCase(current.parent.left.name)) {
    return current.parent.left.name
  }

  if (current.parent?.type === 'ExportDefaultDeclaration') return 'default'
  return null
}

export function isTestFile(filename) {
  const basename = path.basename(filename)
  return basename.endsWith('.test.tsx') || basename.endsWith('.spec.tsx')
}

export function functionVisitors(enter, exit) {
  return {
    ArrowFunctionExpression: enter,
    'ArrowFunctionExpression:exit': exit,
    FunctionDeclaration: enter,
    'FunctionDeclaration:exit': exit,
    FunctionExpression: enter,
    'FunctionExpression:exit': exit,
  }
}
