function getStaticPropertyName(node) {
  if (node?.type === 'Identifier') return node.name
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

function isMapCall(node) {
  return node.callee.type === 'MemberExpression'
    && getStaticPropertyName(node.callee.property) === 'map'
}

function isFunction(node) {
  return node?.type === 'ArrowFunctionExpression'
    || node?.type === 'FunctionExpression'
}

function isComponentName(node) {
  let current = node
  while (current?.type === 'JSXMemberExpression') current = current.object
  return current?.type === 'JSXIdentifier' && /^[A-Z]/u.test(current.name)
}

function isSimpleValue(node) {
  if (!node || node.type === 'JSXEmptyExpression') return true
  if (node.type === 'Identifier' || node.type === 'Literal') return true
  if (node.type === 'ChainExpression'
    || node.type === 'TSAsExpression'
    || node.type === 'TSNonNullExpression'
    || node.type === 'TSTypeAssertion') {
    return isSimpleValue(node.expression)
  }
  if (node.type !== 'MemberExpression') return false
  return isSimpleValue(node.object) && (!node.computed || isSimpleValue(node.property))
}

function hasComplexPropsOrChildren(element) {
  for (const attribute of element.openingElement.attributes) {
    if (attribute.type === 'JSXSpreadAttribute') {
      if (!isSimpleValue(attribute.argument)) return true
      continue
    }
    if (attribute.value?.type === 'JSXExpressionContainer'
      && !isSimpleValue(attribute.value.expression)) return true
  }

  return element.children.some((child) => {
    if (child.type === 'JSXExpressionContainer') return !isSimpleValue(child.expression)
    return child.type === 'JSXElement' || child.type === 'JSXFragment'
  })
}

function isDirectComponentRender(callback) {
  return callback.type === 'ArrowFunctionExpression'
    && callback.expression
    && callback.body.type === 'JSXElement'
    && isComponentName(callback.body.openingElement.name)
    && !hasComplexPropsOrChildren(callback.body)
}

function containsJsx(node, sourceCode) {
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true

  const visitorKeys = sourceCode.visitorKeys[node.type] ?? []
  return visitorKeys.some((key) => {
    const child = node[key]
    if (Array.isArray(child)) {
      return child.some((entry) => entry && containsJsx(entry, sourceCode))
    }
    return child && containsJsx(child, sourceCode)
  })
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require JSX-producing map callbacks to delegate rendering to a component',
    },
    schema: [],
    messages: {
      extractComponent: 'Extract mapped JSX into a component and keep the callback declarative: items.map((item) => <Item key={item.id} item={item} />).',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode

    return {
      CallExpression(node) {
        if (!isMapCall(node)) return

        const callback = node.arguments[0]
        if (!isFunction(callback) || !containsJsx(callback.body, sourceCode)) return
        if (isDirectComponentRender(callback)) return

        context.report({
          node: callback,
          messageId: 'extractComponent',
        })
      },
    }
  },
}
