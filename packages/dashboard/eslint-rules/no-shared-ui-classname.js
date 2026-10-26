import ts from 'typescript'

function unwrap(node) {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node))
  )
    node = node.expression
  return node
}

function isSharedUi(node) {
  return /\/src\/shared\/ui\//u.test(
    node.getSourceFile().fileName.replaceAll('\\', '/'),
  )
}

function propertyName(node) {
  if (!node) return undefined
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text
  if (
    ts.isComputedPropertyName(node) &&
    ts.isStringLiteralLike(unwrap(node.expression))
  )
    return unwrap(node.expression).text
  return undefined
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep className out of shared UI component APIs and put layout on the parent',
    },
    schema: [],
    messages: {
      exposedClassName:
        'Do not expose "className" in shared/ui component props, including inherited React props. Omit it from the API and let the parent own layout. [ui-no-classname-on-shared-ui]',
      suppliedClassName:
        'Do not pass "className" to a shared/ui component, even for layout. Move layout to the parent and use semantic variants for appearance. [ui-no-classname-on-shared-ui]',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap)
      throw new Error('no-shared-ui-classname requires typed linting.')
    const checker = services.program.getTypeChecker()
    const mapped = (node) => services.esTreeNodeToTSNodeMap.get(node)

    function symbolAt(node) {
      let symbol = checker.getSymbolAtLocation(node)
      if (ts.isElementAccessExpression(node)) {
        const key = checker.getTypeAtLocation(node.argumentExpression)
        if (key.isStringLiteral())
          symbol = checker.getPropertyOfType(
            checker.getTypeAtLocation(node.expression),
            key.value,
          )
      }
      if (
        symbol?.valueDeclaration &&
        ts.isShorthandPropertyAssignment(symbol.valueDeclaration)
      )
        symbol = checker.getShorthandAssignmentValueSymbol(
          symbol.valueDeclaration,
        )
      return symbol?.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    }

    function hasClassName(type, seen = new Set()) {
      if (!type || seen.has(type)) return false
      seen.add(type)
      if (type.isUnion())
        return type.types.some((part) => hasClassName(part, seen))
      if (checker.getPropertyOfType(type, 'className')) return true
      const apparent = checker.getApparentType(type)
      if (apparent !== type && hasClassName(apparent, seen)) return true
      return hasClassName(checker.getBaseConstraintOfType(type), seen)
    }

    function reactFactoryName(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return undefined
      seen.add(node)
      const symbol = symbolAt(node)
      if (
        ['createElement', 'cloneElement'].includes(symbol?.name) &&
        symbol.declarations?.some((declaration) =>
          /\/node_modules\/(?:@types\/)?react\//u.test(
            declaration.getSourceFile().fileName.replaceAll('\\', '/'),
          ),
        )
      )
        return symbol.name
      for (const declaration of symbol?.declarations ?? []) {
        const name = reactFactoryName(declaration.initializer, seen)
        if (name) return name
      }
      return undefined
    }

    function isSharedComponent(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (ts.isJsxElement(node))
        return isSharedComponent(node.openingElement.tagName, seen)
      if (ts.isJsxSelfClosingElement(node))
        return isSharedComponent(node.tagName, seen)
      if (ts.isConditionalExpression(node))
        return (
          isSharedComponent(node.whenTrue, seen) ||
          isSharedComponent(node.whenFalse, seen)
        )
      if (ts.isCallExpression(node) && reactFactoryName(node.expression))
        return isSharedComponent(node.arguments[0], seen)
      const type = checker.getTypeAtLocation(node)
      const parts = type.isUnion() ? type.types : [type]
      if (parts.every((part) => part.flags & ts.TypeFlags.StringLike))
        return false
      // Intrinsic JSX tags are identifiers, but their declarations are DOM types.
      for (const declaration of symbolAt(node)?.declarations ?? []) {
        if (isSharedUi(declaration)) return true
        if (isSharedComponent(declaration.initializer, seen)) return true
      }
      return false
    }

    function suppliesClassName(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (hasClassName(checker.getTypeAtLocation(node))) return true
      if (ts.isObjectLiteralExpression(node))
        return node.properties.some((property) =>
          ts.isSpreadAssignment(property)
            ? suppliesClassName(property.expression, seen)
            : propertyName(property.name) === 'className',
        )
      if (ts.isConditionalExpression(node))
        return (
          suppliesClassName(node.whenTrue, seen) ||
          suppliesClassName(node.whenFalse, seen)
        )
      if (
        ts.isBinaryExpression(node) &&
        [
          ts.SyntaxKind.AmpersandAmpersandToken,
          ts.SyntaxKind.BarBarToken,
          ts.SyntaxKind.QuestionQuestionToken,
        ].includes(node.operatorToken.kind)
      )
        return (
          suppliesClassName(node.left, seen) ||
          suppliesClassName(node.right, seen)
        )
      for (const declaration of symbolAt(node)?.declarations ?? [])
        if (suppliesClassName(declaration.initializer, seen)) return true
      return false
    }

    function inspectComponent(location, expression) {
      const type = checker.getTypeAtLocation(expression)
      if (
        type.getCallSignatures().some((signature) => {
          const props = signature.parameters[0]
          return (
            props &&
            hasClassName(checker.getTypeOfSymbolAtLocation(props, expression))
          )
        })
      )
        context.report({
          node: services.tsNodeToESTreeNodeMap.get(location),
          messageId: 'exposedClassName',
        })
    }

    return {
      Program(node) {
        const source = mapped(node)
        if (!isSharedUi(source)) return
        function visit(current) {
          if (
            ts.isFunctionDeclaration(current) &&
            (!current.name || /^[A-Z]/u.test(current.name.text))
          )
            inspectComponent(current.name ?? current, current)
          else if (
            ts.isVariableDeclaration(current) &&
            ts.isIdentifier(current.name) &&
            /^[A-Z]/u.test(current.name.text)
          )
            inspectComponent(current.name, current.name)
          else if (
            ts.isPropertyAssignment(current) &&
            /^[A-Z]/u.test(propertyName(current.name) ?? '')
          )
            inspectComponent(current.name, current.initializer)
          else if (
            ts.isBinaryExpression(current) &&
            current.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            ts.isPropertyAccessExpression(current.left) &&
            /^[A-Z]/u.test(current.left.name.text) &&
            (ts.isArrowFunction(current.right) ||
              ts.isFunctionExpression(current.right) ||
              ts.isCallExpression(current.right))
          )
            inspectComponent(current.left, current.right)
          else if (ts.isExportAssignment(current))
            inspectComponent(current.expression, current.expression)
          ts.forEachChild(current, visit)
        }
        visit(source)
      },
      JSXOpeningElement(node) {
        if (!isSharedComponent(mapped(node).tagName)) return
        for (const attribute of node.attributes) {
          if (
            (attribute.type === 'JSXAttribute' &&
              attribute.name.name === 'className') ||
            (attribute.type === 'JSXSpreadAttribute' &&
              suppliesClassName(mapped(attribute.argument)))
          )
            context.report({
              node: attribute,
              messageId: 'suppliedClassName',
            })
        }
      },
      CallExpression(node) {
        const call = mapped(node)
        if (
          reactFactoryName(call.expression) &&
          isSharedComponent(call.arguments[0]) &&
          suppliesClassName(call.arguments[1])
        )
          context.report({
            node: node.arguments[1],
            messageId: 'suppliedClassName',
          })
      },
    }
  },
}
