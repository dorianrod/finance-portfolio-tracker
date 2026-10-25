import ts from 'typescript'

function unwrap(node) {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    node = node.expression
  }
  return node
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require nested children for project UI and extracted renderers at external API boundaries',
    },
    schema: [],
    messages: {
      nestedChildren:
        'Write children as nested JSX, instead of a children prop.',
      composeChildren:
        'Compose UI through nested children or compound components instead of the "{{prop}}" prop, including component references and render functions.',
      extractRenderer:
        'Extract the renderer for the external "{{prop}}" prop into a module-level component; pass Component or <Component ... /> as required by the library.',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap) {
      throw new Error('require-children-composition requires typed linting.')
    }
    const checker = services.program.getTypeChecker()

    function resolveSymbol(node) {
      const symbol = checker.getSymbolAtLocation(node)
      const declaration = symbol?.valueDeclaration
      if (declaration && ts.isShorthandPropertyAssignment(declaration))
        return checker.getShorthandAssignmentValueSymbol(declaration)
      return symbol?.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    }

    function isExternalSymbol(symbol) {
      return (
        symbol?.declarations?.length > 0 &&
        symbol.declarations.every((declaration) =>
          services.program.isSourceFileFromExternalLibrary(
            declaration.getSourceFile(),
          ),
        )
      )
    }

    function isUiType(type, seen = new Set()) {
      if (!type || seen.has(type)) return false
      seen.add(type)

      if (type.isUnionOrIntersection()) {
        return type.types.some((part) => isUiType(part, seen))
      }
      const symbol = type.getSymbol()
      if (
        ['ReactElement', 'ReactPortal', 'Component', 'PureComponent'].includes(
          symbol?.name,
        ) &&
        symbol.declarations?.some((declaration) =>
          /[/\\]@types[/\\]react[/\\]/u.test(
            declaration.getSourceFile().fileName,
          ),
        )
      )
        return true

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        return checker
          .getTypeArguments(type)
          .some((argument) => isUiType(argument, seen))
      }
      if (
        type.isClassOrInterface?.() &&
        type.getBaseTypes()?.some((base) => isUiType(base, seen))
      )
        return true

      if (type.flags & ts.TypeFlags.TypeParameter)
        return isUiType(checker.getBaseConstraintOfType(type), seen)
      const promisedType = checker.getPromisedTypeOfPromise(type)
      if (promisedType) return isUiType(promisedType, seen)

      return [
        ...type.getCallSignatures(),
        ...type.getConstructSignatures(),
      ].some((signature) =>
        isUiType(checker.getReturnTypeOfSignature(signature), seen),
      )
    }

    function isUiExpression(node) {
      node = unwrap(node)
      return (
        ts.isJsxElement(node) ||
        ts.isJsxSelfClosingElement(node) ||
        ts.isJsxFragment(node) ||
        isUiType(checker.getTypeAtLocation(node))
      )
    }

    function isCallableType(type) {
      if (type.isUnionOrIntersection()) return type.types.some(isCallableType)
      return (
        type.getCallSignatures().length || type.getConstructSignatures().length
      )
    }

    function isInlineRenderer(node) {
      node = unwrap(node)
      if (ts.isConditionalExpression(node)) {
        return (
          isInlineRenderer(node.whenTrue) || isInlineRenderer(node.whenFalse)
        )
      }
      if (ts.isBinaryExpression(node)) {
        return isInlineRenderer(node.left) || isInlineRenderer(node.right)
      }
      if (ts.isJsxElement(node)) node = node.openingElement.tagName
      if (ts.isJsxSelfClosingElement(node)) node = node.tagName
      if (!isCallableType(checker.getTypeAtLocation(node))) return false
      if (!ts.isIdentifier(node) && !ts.isPropertyAccessExpression(node))
        return true

      return resolveSymbol(node)?.declarations?.some((declaration) => {
        for (let parent = declaration.parent; parent; parent = parent.parent) {
          if (ts.isFunctionLike(parent)) return true
        }
        return false
      })
    }

    function inspectValue(reportNode, expression, prop, external) {
      if (!isUiExpression(expression)) return
      if (!external || isInlineRenderer(expression)) {
        context.report({
          node: reportNode,
          messageId: external ? 'extractRenderer' : 'composeChildren',
          data: { prop },
        })
      }
    }

    return {
      JSXOpeningElement(node) {
        const tag = services.esTreeNodeToTSNodeMap.get(node).tagName
        const intrinsic = ts.isIdentifier(tag) && /^[a-z]/u.test(tag.text)
        const external = isExternalSymbol(resolveSymbol(tag))

        for (const attribute of node.attributes) {
          if (attribute.type === 'JSXAttribute') {
            const prop = attribute.name.name
            if (prop === 'children') {
              context.report({ node: attribute, messageId: 'nestedChildren' })
            } else if (
              !intrinsic &&
              attribute.value?.type === 'JSXExpressionContainer' &&
              attribute.value.expression.type !== 'JSXEmptyExpression'
            ) {
              inspectValue(
                attribute,
                services.esTreeNodeToTSNodeMap.get(attribute.value.expression),
                prop,
                external,
              )
            }
            continue
          }
          const argument = services.esTreeNodeToTSNodeMap.get(
            attribute.argument,
          )
          for (const property of checker
            .getTypeAtLocation(argument)
            .getProperties()) {
            const prop = property.name
            const declaration = property.valueDeclaration
            if (prop === 'children') {
              // Inherited children in library SVG/shape types are not explicit slots.
              if (
                declaration &&
                (ts.isPropertyAssignment(declaration) ||
                  ts.isShorthandPropertyAssignment(declaration))
              ) {
                context.report({ node: attribute, messageId: 'nestedChildren' })
              }
              continue
            }
            if (intrinsic) continue
            if (
              !isUiType(checker.getTypeOfSymbolAtLocation(property, argument))
            )
              continue

            if (!external) {
              context.report({
                node: attribute,
                messageId: 'composeChildren',
                data: { prop },
              })
            } else if (declaration && ts.isPropertyAssignment(declaration)) {
              inspectValue(attribute, declaration.initializer, prop, external)
            } else if (
              declaration &&
              ts.isShorthandPropertyAssignment(declaration)
            ) {
              inspectValue(attribute, declaration.name, prop, external)
            }
          }
        }
      },
    }
  },
}
