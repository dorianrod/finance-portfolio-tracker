import path from 'node:path'

const REACT_COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo'])
const EXCLUDED_ATTRIBUTE_NAMES = new Set(['children', 'key', 'ref'])
const DERIVED_EXPRESSION_TYPES = new Set([
  'ArrayExpression',
  'BinaryExpression',
  'CallExpression',
  'ConditionalExpression',
  'LogicalExpression',
  'NewExpression',
  'ObjectExpression',
  'TaggedTemplateExpression',
  'TemplateLiteral',
  'UnaryExpression',
  'UpdateExpression',
])

function isPascalCase(name) {
  return typeof name === 'string' && /^[A-Z]/u.test(name)
}

function getStaticPropertyName(node) {
  if (!node) return null
  if (node.type === 'Identifier') return node.name
  if (node.type === 'Literal' && typeof node.value === 'string')
    return node.value
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

function isHookCall(node) {
  const name =
    node?.type === 'CallExpression' ? getCalleeName(node.callee) : null
  return typeof name === 'string' && /^use[A-Z0-9]/u.test(name)
}

function isReactComponentWrapper(node) {
  return (
    node?.type === 'CallExpression' &&
    REACT_COMPONENT_WRAPPERS.has(getCalleeName(node.callee))
  )
}

function getFunctionComponentName(node) {
  if (isPascalCase(node.id?.name)) return node.id.name

  let current = node
  while (
    isReactComponentWrapper(current.parent) &&
    current.parent.arguments.includes(current)
  ) {
    current = current.parent
  }

  if (
    current.parent?.type === 'VariableDeclarator' &&
    current.parent.init === current &&
    current.parent.id.type === 'Identifier' &&
    isPascalCase(current.parent.id.name)
  ) {
    return current.parent.id.name
  }

  if (
    current.parent?.type === 'AssignmentExpression' &&
    current.parent.right === current &&
    current.parent.left.type === 'Identifier' &&
    isPascalCase(current.parent.left.name)
  ) {
    return current.parent.left.name
  }

  if (current.parent?.type === 'ExportDefaultDeclaration') return 'default'
  return null
}

function getClassComponentName(node) {
  const superClassName = getCalleeName(node.superClass)
  if (superClassName !== 'Component' && superClassName !== 'PureComponent')
    return null

  if (isPascalCase(node.id?.name)) return node.id.name
  if (
    node.parent?.type === 'VariableDeclarator' &&
    node.parent.init === node &&
    node.parent.id.type === 'Identifier' &&
    isPascalCase(node.parent.id.name)
  ) {
    return node.parent.id.name
  }
  if (node.parent?.type === 'ExportDefaultDeclaration') return 'default'
  return null
}

function isFunctionNode(node) {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  )
}

function isClassNode(node) {
  return node?.type === 'ClassDeclaration' || node?.type === 'ClassExpression'
}

function roleFromPath(value) {
  if (value.endsWith('.view') || value.endsWith('.view.tsx')) return 'view'
  if (value.endsWith('.state') || value.endsWith('.state.tsx')) return 'state'
  if (value.endsWith('.feature') || value.endsWith('.feature.tsx'))
    return 'feature'
  return null
}

function unwrapExpression(node) {
  let current = node
  while (
    current?.type === 'ChainExpression' ||
    current?.type === 'TSAsExpression' ||
    current?.type === 'TSNonNullExpression' ||
    current?.type === 'TSTypeAssertion'
  ) {
    current = current.expression
  }
  return current
}

function combineAnalyses(analyses, derived = false) {
  const relevant = analyses.filter(({ dependsOnProps }) => dependsOnProps)
  if (relevant.length === 0) {
    return { dependsOnProps: false, derived: false, propName: null }
  }

  const propNames = new Set(
    relevant.map(({ propName }) => propName).filter(Boolean),
  )
  return {
    dependsOnProps: true,
    derived: derived || relevant.some((analysis) => analysis.derived),
    propName: propNames.size === 1 ? [...propNames][0] : null,
  }
}

function createRule(context) {
  const sourceCode = context.sourceCode
  const moduleRole = roleFromPath(path.basename(context.filename))
  const componentContexts = new WeakMap()
  const forwardingEdges = []

  function findVariable(identifier) {
    let scope = sourceCode.getScope(identifier)
    while (scope) {
      const variable = scope.set.get(identifier.name)
      if (variable) return variable
      scope = scope.upper
    }
    return null
  }

  function registerPattern(pattern, propertyName, propVariables) {
    if (!pattern) return
    if (pattern.type === 'Identifier') {
      const variable = findVariable(pattern)
      if (variable) propVariables.set(variable, propertyName)
      return
    }
    if (pattern.type === 'AssignmentPattern') {
      registerPattern(pattern.left, propertyName, propVariables)
      return
    }
    if (pattern.type === 'RestElement') {
      registerPattern(pattern.argument, null, propVariables)
      return
    }
    if (pattern.type !== 'ObjectPattern') return

    for (const property of pattern.properties) {
      if (property.type === 'RestElement') {
        registerPattern(property.argument, null, propVariables)
        continue
      }
      const name = property.computed
        ? null
        : getStaticPropertyName(property.key)
      registerPattern(property.value, name, propVariables)
    }
  }

  function getFunctionContext(node) {
    if (componentContexts.has(node)) return componentContexts.get(node)

    const name = getFunctionComponentName(node)
    if (!name) {
      componentContexts.set(node, null)
      return null
    }

    const firstParameter = node.params[0]
    const propVariables = new Map()
    let propsObjectVariable = null
    if (firstParameter?.type === 'Identifier') {
      propsObjectVariable = findVariable(firstParameter)
    } else if (firstParameter) {
      registerPattern(firstParameter, null, propVariables)
    }

    const componentContext = {
      kind: 'function',
      name,
      propVariables,
      propsObjectVariable,
    }
    componentContexts.set(node, componentContext)
    return componentContext
  }

  function getClassContext(node) {
    if (componentContexts.has(node)) return componentContexts.get(node)
    const name = getClassComponentName(node)
    const componentContext = name
      ? {
          kind: 'class',
          name,
          propVariables: new Map(),
          propsObjectVariable: null,
        }
      : null
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

  function getApplicationComponent(nameNode) {
    const rootIdentifier = getRootJsxIdentifier(nameNode)
    if (!rootIdentifier || !isPascalCase(rootIdentifier.name)) return null

    const variable = findVariable(rootIdentifier)
    if (!variable) return null

    for (const definition of variable.defs) {
      if (definition.type === 'Parameter') return null
      if (definition.type === 'ImportBinding') {
        const source = definition.parent.source.value
        return {
          name: sourceCode.getText(nameNode),
          role: typeof source === 'string' ? roleFromPath(source) : null,
        }
      }
    }

    return { name: sourceCode.getText(nameNode), role: moduleRole }
  }

  function analyzeExpression(
    node,
    componentContext,
    state = {
      seenNodes: new Set(),
      seenVariables: new Set(),
    },
  ) {
    const expression = unwrapExpression(node)
    if (!expression || state.seenNodes.has(expression)) {
      return { dependsOnProps: false, derived: false, propName: null }
    }
    state.seenNodes.add(expression)

    if (
      expression.type === 'ArrowFunctionExpression' ||
      expression.type === 'FunctionExpression'
    ) {
      return { dependsOnProps: false, derived: false, propName: null }
    }

    // A hook owns the derivation of its return value. Treat that result as a
    // feature input, rather than attributing every value it exposes to the
    // component props used to configure the hook.
    if (isHookCall(expression)) {
      return { dependsOnProps: false, derived: false, propName: null }
    }

    if (
      componentContext.kind === 'class' &&
      expression.type === 'MemberExpression' &&
      !expression.computed &&
      expression.object.type === 'MemberExpression' &&
      !expression.object.computed &&
      expression.object.object.type === 'ThisExpression' &&
      getStaticPropertyName(expression.object.property) === 'props'
    ) {
      return {
        dependsOnProps: true,
        derived: false,
        propName: getStaticPropertyName(expression.property),
      }
    }

    if (expression.type === 'MemberExpression') {
      const object = unwrapExpression(expression.object)
      if (
        object?.type === 'Identifier' &&
        findVariable(object) === componentContext.propsObjectVariable
      ) {
        return {
          dependsOnProps: true,
          derived: false,
          propName: expression.computed
            ? null
            : getStaticPropertyName(expression.property),
        }
      }
      return analyzeExpression(expression.object, componentContext, state)
    }

    if (expression.type === 'Identifier') {
      const variable = findVariable(expression)
      if (!variable)
        return { dependsOnProps: false, derived: false, propName: null }
      if (componentContext.propVariables.has(variable)) {
        return {
          dependsOnProps: true,
          derived: false,
          propName: componentContext.propVariables.get(variable),
        }
      }
      if (state.seenVariables.has(variable)) {
        return { dependsOnProps: false, derived: false, propName: null }
      }
      state.seenVariables.add(variable)

      const analyses = []
      for (const definition of variable.defs) {
        if (definition.type === 'Variable' && definition.node.init) {
          analyses.push(
            analyzeExpression(definition.node.init, componentContext, state),
          )
        }
      }
      for (const reference of variable.references) {
        if (reference.writeExpr) {
          analyses.push(
            analyzeExpression(reference.writeExpr, componentContext, state),
          )
        }
      }
      return combineAnalyses(analyses)
    }

    const analyses = []
    for (const key of sourceCode.visitorKeys[expression.type] ?? []) {
      const child = expression[key]
      if (Array.isArray(child)) {
        for (const childNode of child) {
          analyses.push(analyzeExpression(childNode, componentContext, state))
        }
      } else {
        analyses.push(analyzeExpression(child, componentContext, state))
      }
    }

    return combineAnalyses(
      analyses,
      DERIVED_EXPRESSION_TYPES.has(expression.type),
    )
  }

  function inspectAttribute(node) {
    const attributeName =
      node.name.type === 'JSXIdentifier' ? node.name.name : null
    if (!attributeName || EXCLUDED_ATTRIBUTE_NAMES.has(attributeName)) return
    if (node.value?.type !== 'JSXExpressionContainer') return

    const child = getApplicationComponent(node.parent.name)
    if (!child || (child.role !== 'feature' && child.role !== 'state')) return

    for (const componentContext of getEnclosingComponentContexts(node)) {
      const analysis = analyzeExpression(
        node.value.expression,
        componentContext,
      )
      if (!analysis.dependsOnProps) continue

      if (analysis.derived) {
        context.report({
          node,
          messageId:
            child.role === 'state'
              ? 'inlineStateConstruction'
              : 'derivedBusinessProp',
          data: {
            attributeName,
            childName: child.name,
            childRole: child.role,
            parentName: componentContext.name,
          },
        })
        return
      }

      if (analysis.propName) {
        forwardingEdges.push({
          attributeName,
          childName: child.name,
          childRole: child.role,
          node,
          parentName: componentContext.name,
          sourcePropName: analysis.propName,
        })
      }
      return
    }
  }

  function reportPropChains() {
    const incomingPropsByComponent = new Map()
    for (const edge of forwardingEdges) {
      if (!incomingPropsByComponent.has(edge.childName)) {
        incomingPropsByComponent.set(edge.childName, new Set())
      }
      incomingPropsByComponent.get(edge.childName).add(edge.attributeName)
    }

    for (const edge of forwardingEdges) {
      const incomingProps = incomingPropsByComponent.get(edge.parentName)
      if (!incomingProps?.has(edge.sourcePropName)) continue
      context.report({
        node: edge.node,
        messageId: 'propDrilling',
        data: {
          attributeName: edge.attributeName,
          childName: edge.childName,
          childRole: edge.childRole,
          parentName: edge.parentName,
          sourcePropName: edge.sourcePropName,
        },
      })
    }
  }

  return {
    JSXAttribute: inspectAttribute,
    'Program:exit': reportPropChains,
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Detect prop chains and calculations assigned to feature or state-rendering components',
    },
    schema: [],
    messages: {
      derivedBusinessProp:
        'Business ownership: "{{parentName}}" calculates "{{childName}}.{{attributeName}}" from its props. Pass raw inputs and let the {{childRole}} component own the calculation, or classify the child as a view.',
      inlineStateConstruction:
        'State ownership: "{{parentName}}" constructs "{{childName}}.{{attributeName}}" inline. Resolve the discriminated union before rendering and pass it directly.',
      propDrilling:
        'Prop drilling: "{{parentName}}" forwards its "{{sourcePropName}}" prop to {{childRole}} component "{{childName}}.{{attributeName}}".',
    },
  },
  create: createRule,
}
