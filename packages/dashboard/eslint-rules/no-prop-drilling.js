const REACT_COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo'])
const EXCLUDED_ATTRIBUTE_NAMES = new Set(['children', 'key', 'ref'])

function isPascalCase(name) {
  return typeof name === 'string' && /^[A-Z]/u.test(name)
}

function getStaticPropertyName(node) {
  if (!node) return null
  if (node.type === 'Identifier') return node.name
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

function getRootJsxIdentifier(node) {
  let current = node
  while (current?.type === 'JSXMemberExpression') current = current.object
  return current?.type === 'JSXIdentifier' ? current : null
}

function getCalleeName(node) {
  if (node?.type === 'Identifier') return node.name
  if (node?.type === 'MemberExpression' && !node.computed) {
    return getStaticPropertyName(node.property)
  }
  return null
}

function isReactComponentWrapper(node) {
  return node?.type === 'CallExpression'
    && REACT_COMPONENT_WRAPPERS.has(getCalleeName(node.callee))
}

function getFunctionComponentName(node) {
  if (isPascalCase(node.id?.name)) return node.id.name

  let current = node
  while (isReactComponentWrapper(current.parent)
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

function getClassComponentName(node) {
  const superClassName = getCalleeName(node.superClass)
  if (superClassName !== 'Component' && superClassName !== 'PureComponent') return null

  if (isPascalCase(node.id?.name)) return node.id.name
  if (node.parent?.type === 'VariableDeclarator'
    && node.parent.init === node
    && node.parent.id.type === 'Identifier'
    && isPascalCase(node.parent.id.name)) {
    return node.parent.id.name
  }
  if (node.parent?.type === 'ExportDefaultDeclaration') return 'default'
  return null
}

function isFunctionNode(node) {
  return node?.type === 'FunctionDeclaration'
    || node?.type === 'FunctionExpression'
    || node?.type === 'ArrowFunctionExpression'
}

function isClassNode(node) {
  return node?.type === 'ClassDeclaration' || node?.type === 'ClassExpression'
}

function isNodeWithin(node, container) {
  return node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
}

function isApplicationImport(source) {
  return source.startsWith('.') || source.startsWith('@/')
}

function createRule(context) {
  const sourceCode = context.sourceCode
  const componentContexts = new WeakMap()

  function findVariable(identifier) {
    let scope = sourceCode.getScope(identifier)
    while (scope) {
      const variable = scope.set.get(identifier.name)
      if (variable) return variable
      scope = scope.upper
    }
    return null
  }

  function getFunctionContext(node) {
    if (componentContexts.has(node)) return componentContexts.get(node)

    const name = getFunctionComponentName(node)
    if (!name) {
      componentContexts.set(node, null)
      return null
    }

    const firstParameter = node.params[0]
    const propVariables = new Set()
    if (firstParameter) {
      for (const variable of sourceCode.getDeclaredVariables(node)) {
        const isPropVariable = variable.defs.some((definition) => (
          definition.type === 'Parameter'
          && definition.name?.range
          && isNodeWithin(definition.name, firstParameter)
        ))
        if (isPropVariable) propVariables.add(variable)
      }
    }

    const componentContext = { kind: 'function', name, node, propVariables }
    componentContexts.set(node, componentContext)
    return componentContext
  }

  function getClassContext(node) {
    if (componentContexts.has(node)) return componentContexts.get(node)

    const name = getClassComponentName(node)
    const componentContext = name ? { kind: 'class', name, node, propVariables: new Set() } : null
    componentContexts.set(node, componentContext)
    return componentContext
  }

  function getEnclosingComponentContexts(node) {
    const contexts = []
    let current = node.parent

    while (current) {
      if (isFunctionNode(current)) {
        const componentContext = getFunctionContext(current)
        if (componentContext) contexts.push(componentContext)
      } else if (isClassNode(current)) {
        const componentContext = getClassContext(current)
        if (componentContext) contexts.push(componentContext)
      }
      current = current.parent
    }

    return contexts
  }

  function isApplicationComponent(nameNode) {
    const rootIdentifier = getRootJsxIdentifier(nameNode)
    if (!rootIdentifier || !isPascalCase(rootIdentifier.name)) return false

    const variable = findVariable(rootIdentifier)
    if (!variable) return false

    return variable.defs.some((definition) => {
      if (definition.type !== 'ImportBinding') return definition.type !== 'Parameter'
      return isApplicationImport(definition.parent.source.value)
    })
  }

  function isThisProps(node) {
    return node?.type === 'MemberExpression'
      && !node.computed
      && node.object.type === 'ThisExpression'
      && getStaticPropertyName(node.property) === 'props'
  }

  function expressionDependsOnProps(node, componentContext, state) {
    if (!node || state.seenNodes.has(node)) return false
    state.seenNodes.add(node)

    if (componentContext.kind === 'class' && isThisProps(node)) return true

    if (node.type === 'Identifier') {
      const variable = findVariable(node)
      if (!variable) return false
      if (componentContext.propVariables.has(variable)) return true
      if (state.seenVariables.has(variable)) return false

      state.seenVariables.add(variable)

      for (const definition of variable.defs) {
        if (definition.type === 'Variable'
          && definition.node.init
          && expressionDependsOnProps(definition.node.init, componentContext, state)) {
          return true
        }
        if (definition.type === 'FunctionName'
          && expressionDependsOnProps(definition.node.body, componentContext, state)) {
          return true
        }
      }

      for (const reference of variable.references) {
        if (reference.writeExpr
          && expressionDependsOnProps(reference.writeExpr, componentContext, state)) {
          return true
        }
      }

      return false
    }

    const visitorKeys = sourceCode.visitorKeys[node.type] ?? []
    for (const key of visitorKeys) {
      const child = node[key]
      if (Array.isArray(child)) {
        for (const childNode of child) {
          if (expressionDependsOnProps(childNode, componentContext, state)) return true
        }
      } else if (expressionDependsOnProps(child, componentContext, state)) {
        return true
      }
    }

    return false
  }

  function attributeDependsOnProps(attribute, componentContext) {
    if (attribute.value?.type !== 'JSXExpressionContainer') return false
    return expressionDependsOnProps(attribute.value.expression, componentContext, {
      seenNodes: new Set(),
      seenVariables: new Set(),
    })
  }

  return {
    JSXAttribute(node) {
      const attributeName = node.name.type === 'JSXIdentifier' ? node.name.name : null
      if (!attributeName || EXCLUDED_ATTRIBUTE_NAMES.has(attributeName)) return

      const openingElement = node.parent
      if (!isApplicationComponent(openingElement.name)) return

      const componentContextsForAttribute = getEnclosingComponentContexts(node)
      const sourceComponent = componentContextsForAttribute.find((componentContext) => (
        attributeDependsOnProps(node, componentContext)
      ))
      if (!sourceComponent) return

      context.report({
        node,
        messageId: 'propDrilling',
        data: {
          attributeName,
          childName: sourceCode.getText(openingElement.name),
          parentName: sourceComponent.name,
        },
      })
    },
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing values derived from parent props to application components',
    },
    schema: [],
    messages: {
      propDrilling: 'Prop drilling: "{{parentName}}" passes a value derived from its props to "{{childName}}.{{attributeName}}".',
    },
  },
  create: createRule,
}
