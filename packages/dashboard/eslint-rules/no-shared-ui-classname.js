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
        'Keep className and style out of shared UI APIs and put layout on the parent',
    },
    schema: [],
    messages: {
      exposedClassName:
        'Do not expose "className" in shared/ui component props, including inherited React props. Omit it from the API and let the parent own layout. [ui-no-classname-on-shared-ui]',
      suppliedClassName:
        'Do not pass "className" to a shared/ui component, even for layout. Move layout to the parent and use semantic variants for appearance. [ui-no-classname-on-shared-ui]',
      exposedStyle:
        'Do not expose "style" in shared/ui component props, including inherited library props. Use semantic variants and keep caller layout outside the primitive. [styling-external-layout-only]',
      suppliedStyle:
        'Do not pass "style" to a shared/ui component, even for layout. Move layout to the parent and use semantic variants for appearance. [styling-external-layout-only]',
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

    function hasProperty(type, property, seen = new Set()) {
      if (!type || seen.has(type)) return false
      seen.add(type)
      if (type.isUnion())
        return type.types.some((part) => hasProperty(part, property, seen))
      if (checker.getPropertyOfType(type, property)) return true
      const apparent = checker.getApparentType(type)
      if (apparent !== type && hasProperty(apparent, property, seen))
        return true
      return hasProperty(checker.getBaseConstraintOfType(type), property, seen)
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

    function suppliesProperty(input, property, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (hasProperty(checker.getTypeAtLocation(node), property)) return true
      if (ts.isObjectLiteralExpression(node))
        return node.properties.some((entry) =>
          ts.isSpreadAssignment(entry)
            ? suppliesProperty(entry.expression, property, seen)
            : propertyName(entry.name) === property,
        )
      if (ts.isConditionalExpression(node))
        return (
          suppliesProperty(node.whenTrue, property, seen) ||
          suppliesProperty(node.whenFalse, property, seen)
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
          suppliesProperty(node.left, property, seen) ||
          suppliesProperty(node.right, property, seen)
        )
      for (const declaration of symbolAt(node)?.declarations ?? [])
        if (suppliesProperty(declaration.initializer, property, seen))
          return true
      return false
    }

    function inspectComponent(location, expression) {
      const type = checker.getTypeAtLocation(expression)
      const property = ['className', 'style'].find((property) =>
        type.getCallSignatures().some((signature) => {
          const props = signature.parameters[0]
          return (
            props &&
            hasProperty(
              checker.getTypeOfSymbolAtLocation(props, expression),
              property,
            )
          )
        }),
      )
      if (property)
        context.report({
          node: services.tsNodeToESTreeNodeMap.get(location),
          messageId:
            property === 'className' ? 'exposedClassName' : 'exposedStyle',
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
          const property = ['className', 'style'].find(
            (property) =>
              (attribute.type === 'JSXAttribute' &&
                attribute.name.name === property) ||
              (attribute.type === 'JSXSpreadAttribute' &&
                suppliesProperty(mapped(attribute.argument), property)),
          )
          if (property)
            context.report({
              node: attribute,
              messageId:
                property === 'className'
                  ? 'suppliedClassName'
                  : 'suppliedStyle',
            })
        }
      },
      CallExpression(node) {
        const call = mapped(node)
        if (
          reactFactoryName(call.expression) &&
          isSharedComponent(call.arguments[0])
        ) {
          const property = ['className', 'style'].find((property) =>
            suppliesProperty(call.arguments[1], property),
          )
          if (property)
            context.report({
              node: node.arguments[1],
              messageId:
                property === 'className'
                  ? 'suppliedClassName'
                  : 'suppliedStyle',
            })
        }
      },
    }
  },
}
