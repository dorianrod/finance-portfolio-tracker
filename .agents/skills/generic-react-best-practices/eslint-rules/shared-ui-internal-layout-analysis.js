import ts from 'typescript'

import {
  isLayoutClass,
  isLayoutProperty,
  splitOutside,
} from './styling-layout.js'

export function isUiImplementation(source) {
  const name = source.fileName.replaceAll('\\', '/')
  return (
    name.includes('/src/shared/ui/') &&
    !name.includes('/storybook/') &&
    !/\.(test|spec)\./u.test(name)
  )
}

function unwrap(node) {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isTypeAssertionExpression(node))
  )
    node = node.expression
  return node
}

export function createInternalLayoutAnalysis(program) {
  const checker = program.getTypeChecker()
  const boundaries = new Map()
  const bodies = new Map()
  const childBoundaries = new Map()

  function symbolAt(node) {
    if (!node) return undefined
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

  function nameOf(node) {
    if (!node) return undefined
    if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text
    if (ts.isComputedPropertyName(node)) {
      const type = checker.getTypeAtLocation(node.expression)
      if (type.isStringLiteral()) return type.value
    }
    return undefined
  }

  function factory(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return undefined
    seen.add(node)
    const symbol = symbolAt(node)
    if (
      ['createElement', 'cloneElement'].includes(symbol?.name) &&
      symbol.declarations?.some((d) =>
        /\/node_modules\/(?:@types\/)?react\//u.test(
          d.getSourceFile().fileName.replaceAll('\\', '/'),
        ),
      )
    )
      return symbol.name
    for (const d of symbol?.declarations ?? []) {
      const found = factory(d.initializer, seen)
      if (found) return found
    }
    return undefined
  }

  function componentBodies(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return []
    if (bodies.has(node)) return bodies.get(node)
    seen.add(node)
    const result = []
    if (ts.isFunctionLike(node) && node.body) result.push(node.body)
    else if (ts.isCallExpression(node)) {
      // memo/forwardRef and aliases preserve the implementation boundary.
      for (const argument of node.arguments)
        result.push(...componentBodies(argument, seen))
    } else {
      for (const d of symbolAt(node)?.declarations ?? []) {
        if (d.getSourceFile().isDeclarationFile) continue
        if (ts.isFunctionLike(d) && d.body) result.push(d.body)
        else if (d.initializer)
          result.push(...componentBodies(d.initializer, seen))
        else if (ts.isBinaryExpression(d))
          result.push(...componentBodies(d.right, seen))
        else if (
          ts.isPropertyAccessExpression(d) &&
          ts.isBinaryExpression(d.parent) &&
          d.parent.left === d
        )
          result.push(...componentBodies(d.parent.right, seen))
      }
    }
    bodies.set(node, result)
    return result
  }

  function intrinsic(node) {
    node = unwrap(node)
    if (!node) return false
    if (
      ts.isIdentifier(node) &&
      /^[a-z]/u.test(node.text) &&
      (ts.isJsxOpeningElement(node.parent) ||
        ts.isJsxSelfClosingElement(node.parent)) &&
      node.parent.tagName === node
    )
      return true
    function stringType(type, seen = new Set()) {
      if (!type || seen.has(type)) return false
      seen.add(type)
      if (type.isUnion())
        return type.types.every((part) => stringType(part, new Set(seen)))
      if (type.flags & ts.TypeFlags.StringLike) return true
      const constraint = checker.getBaseConstraintOfType(type)
      return constraint && constraint !== type
        ? stringType(constraint, seen)
        : false
    }
    return stringType(checker.getTypeAtLocation(node))
  }

  function externalBox(node) {
    const declarations = symbolAt(node)?.declarations ?? []
    if (
      !declarations.length ||
      !declarations.every((d) => d.getSourceFile().isDeclarationFile)
    )
      return false
    const type = checker.getTypeAtLocation(node)
    return type.getCallSignatures().some((signature) => {
      const props = signature.parameters[0]
      return (
        props &&
        checker.getPropertyOfType(
          checker.getTypeOfSymbolAtLocation(props, node),
          'className',
        )
      )
    })
  }

  function rendersBox(node, seen = new Set()) {
    if (boundaries.has(node)) return boundaries.get(node)
    if (seen.has(node)) return false
    seen.add(node)
    let result = false
    function visit(current) {
      if (result) return
      if (
        ts.isJsxOpeningElement(current) ||
        ts.isJsxSelfClosingElement(current)
      ) {
        const tag = current.tagName
        if (intrinsic(tag) || externalBox(tag)) result = true
        else if (componentBodies(tag).some((body) => rendersBox(body, seen)))
          result = true
      } else if (
        ts.isCallExpression(current) &&
        factory(current.expression) &&
        current.arguments[0]
      ) {
        const tag = current.arguments[0]
        if (
          intrinsic(tag) ||
          externalBox(tag) ||
          componentBodies(tag).some((body) => rendersBox(body, seen))
        )
          result = true
      }
      ts.forEachChild(current, visit)
    }
    visit(node)
    boundaries.set(node, result)
    return result
  }

  function isShared(node, seen = new Set()) {
    node = unwrap(node)
    if (!node || intrinsic(node) || seen.has(node)) return false
    seen.add(node)
    for (const d of symbolAt(node)?.declarations ?? []) {
      if (isUiImplementation(d.getSourceFile())) return true
      if (d.initializer && isShared(d.initializer, seen)) return true
    }
    return false
  }

  function boundary(tag) {
    return (
      isShared(tag) && componentBodies(tag).some((body) => rendersBox(body))
    )
  }

  function parameterBinding(declaration, callable) {
    let current = declaration
    while (current && !ts.isParameter(current)) current = current.parent
    return current && callable.parameters?.includes(current)
  }

  function propsParameter(input, callable, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    return (symbolAt(node)?.declarations ?? []).some((declaration) => {
      if (ts.isParameter(declaration))
        return callable.parameters?.includes(declaration)
      if (ts.isBindingElement(declaration))
        return (
          !!declaration.dotDotDotToken &&
          parameterBinding(declaration, callable)
        )
      return (
        ts.isVariableDeclaration(declaration) &&
        propsParameter(declaration.initializer, callable, seen)
      )
    })
  }

  function childrenReference(input, callable, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (
      (ts.isPropertyAccessExpression(node) && node.name.text === 'children') ||
      (ts.isElementAccessExpression(node) &&
        nameOf(node.argumentExpression) === 'children')
    )
      return propsParameter(node.expression, callable)
    return (symbolAt(node)?.declarations ?? []).some((declaration) => {
      if (
        ts.isBindingElement(declaration) &&
        nameOf(declaration.propertyName ?? declaration.name) === 'children'
      ) {
        const binding = declaration.parent.parent
        return (
          (ts.isParameter(binding) && callable.parameters?.includes(binding)) ||
          (ts.isVariableDeclaration(binding) &&
            propsParameter(binding.initializer, callable))
        )
      }
      return (
        ts.isVariableDeclaration(declaration) &&
        childrenReference(declaration.initializer, callable, seen)
      )
    })
  }

  // A business wrapper preserves the UI boundary when it renders its caller's
  // children inside a primitive. Its own external container stays unrestricted.
  function forwardsChildren(tag, seen = new Set()) {
    if (!tag || seen.has(tag)) return false
    if (childBoundaries.has(tag)) return childBoundaries.get(tag)
    seen.add(tag)
    const result = componentBodies(tag).some((body) => {
      const callable = body.parent
      if (
        !callable.parameters?.some((parameter) => {
          if (
            ts.isObjectBindingPattern(parameter.name) &&
            parameter.name.elements.some(
              (binding) =>
                nameOf(binding.propertyName ?? binding.name) === 'children',
            )
          )
            return true
          const type = checker.getTypeAtLocation(parameter)
          return (
            !!(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) ||
            !!checker.getPropertyOfType(type, 'children')
          )
        })
      )
        return false
      let found = false
      function visit(node, inside = false) {
        if (!node || found) return
        if (inside && childrenReference(node, callable)) {
          found = true
          return
        }
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
          const opening = ts.isJsxElement(node) ? node.openingElement : node
          const within =
            inside ||
            boundary(opening.tagName) ||
            forwardsChildren(opening.tagName, new Set(seen))
          for (const attribute of opening.attributes.properties) {
            if (
              within &&
              ts.isJsxSpreadAttribute(attribute) &&
              propsParameter(attribute.expression, callable) &&
              checker.getPropertyOfType(
                checker.getTypeAtLocation(attribute.expression),
                'children',
              )
            )
              found = true
            if (
              within &&
              ts.isJsxAttribute(attribute) &&
              attribute.name.text === 'children'
            )
              visit(attribute.initializer, true)
          }
          if (ts.isJsxElement(node))
            for (const child of node.children) visit(child, within)
          return
        }
        if (ts.isCallExpression(node) && factory(node.expression)) {
          const within =
            inside ||
            boundary(node.arguments[0]) ||
            forwardsChildren(node.arguments[0], new Set(seen))
          for (const child of node.arguments.slice(1)) visit(child, within)
          return
        }
        ts.forEachChild(node, (child) => visit(child, inside))
      }
      visit(body)
      return found
    })
    childBoundaries.set(tag, result)
    return result
  }

  function elementBoundary(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (ts.isJsxElement(node)) return boundary(node.openingElement.tagName)
    if (ts.isJsxSelfClosingElement(node)) return boundary(node.tagName)
    if (ts.isCallExpression(node) && factory(node.expression)) {
      return factory(node.expression) === 'cloneElement'
        ? elementBoundary(node.arguments[0], seen)
        : boundary(node.arguments[0])
    }
    if (ts.isConditionalExpression(node))
      return (
        elementBoundary(node.whenTrue, seen) ||
        elementBoundary(node.whenFalse, seen)
      )
    return (symbolAt(node)?.declarations ?? []).some(
      (d) => d.initializer && elementBoundary(d.initializer, seen),
    )
  }

  function staticStrings(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return null
    seen.add(node)
    if (ts.isStringLiteralLike(node)) return [node.text]
    if (ts.isConditionalExpression(node)) {
      const a = staticStrings(node.whenTrue, new Set(seen)),
        b = staticStrings(node.whenFalse, new Set(seen))
      return a && b ? [...a, ...b] : null
    }
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken,
      ].includes(node.operatorToken.kind)
    )
      return staticStrings(node.right, seen)
    const type = checker.getTypeAtLocation(node)
    const parts = type.isUnion() ? type.types : [type]
    if (parts.every((p) => p.isStringLiteral()))
      return parts.map((p) => p.value)
    if (ts.isTemplateExpression(node)) {
      let values = [node.head.text]
      for (const span of node.templateSpans) {
        const additions = staticStrings(span.expression, new Set(seen))
        if (!additions || additions.length * values.length > 128) return null
        values = values.flatMap((value) =>
          additions.map((a) => value + a + span.literal.text),
        )
      }
      return values
    }
    for (const d of symbolAt(node)?.declarations ?? []) {
      if (d.initializer) return staticStrings(d.initializer, seen)
    }
    return null
  }

  function styleLayout(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (ts.isObjectLiteralExpression(node))
      return node.properties.some((p) =>
        ts.isSpreadAssignment(p)
          ? styleLayout(p.expression, seen)
          : isLayoutProperty(nameOf(p.name) ?? ''),
      )
    if (ts.isConditionalExpression(node))
      return (
        styleLayout(node.whenTrue, seen) || styleLayout(node.whenFalse, seen)
      )
    for (const d of symbolAt(node)?.declarations ?? [])
      if (d.initializer && styleLayout(d.initializer, seen)) return true
    return checker
      .getTypeAtLocation(node)
      .getProperties()
      .some((p) => isLayoutProperty(p.name))
  }

  function hasVisualChild(node, seen = new Set()) {
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      boundary(node.tagName)
    )
      return true
    for (const body of ts.isJsxOpeningElement(node) ||
    ts.isJsxSelfClosingElement(node)
      ? componentBodies(node.tagName)
      : [])
      if (hasVisualChild(body, seen)) return true
    if (
      ts.isCallExpression(node) &&
      factory(node.expression) &&
      elementBoundary(node)
    )
      return true
    let found = false
    ts.forEachChild(node, (child) => {
      if (hasVisualChild(child, seen)) found = true
    })
    return found
  }

  function inspect(source) {
    const findings = []
    const visited = new Map()
    const reported = new Set()
    function report(node, owner, kind) {
      if (isUiImplementation(node.getSourceFile()) || reported.has(node)) return
      reported.add(node)
      findings.push({ node, owner, kind })
    }
    function props(input, inside, shared, owner, element, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return
      seen.add(node)
      if (ts.isObjectLiteralExpression(node)) {
        for (const p of node.properties) {
          if (ts.isSpreadAssignment(p))
            props(p.expression, inside, shared, owner, element, seen)
          else if (
            ts.isPropertyAssignment(p) ||
            ts.isShorthandPropertyAssignment(p)
          )
            attribute(
              p,
              nameOf(p.name),
              p.initializer ?? p.name,
              inside,
              shared,
              owner,
              element,
            )
        }
      } else {
        let resolved = false
        for (const d of symbolAt(node)?.declarations ?? [])
          if (d.initializer) {
            resolved = true
            props(d.initializer, inside, shared, owner, element, seen)
          }
        if (!resolved && (inside || shared)) {
          const type = checker.getTypeAtLocation(node)
          if (
            ['className', 'style'].some((name) =>
              checker
                .getPropertyOfType(type, name)
                ?.declarations?.some(
                  (d) => !d.getSourceFile().isDeclarationFile,
                ),
            )
          )
            report(node, owner, 'unverifiable')
        }
      }
    }
    function attribute(node, name, value, inside, shared, owner, element) {
      if (name === 'className') {
        const strings = staticStrings(value)
        if (inside || shared) {
          if (!strings) report(node, owner, 'unverifiable')
          else if (
            strings.some((s) =>
              (splitOutside(s, /\s/u) ?? []).some(isLayoutClass),
            )
          )
            report(node, owner, 'internal')
        } else if (
          strings?.some((s) =>
            /\[(?:&[^\]]*(?:_|>|\s)|[^\]]*\s)|(?:^|\s)\*\*?:/u.test(s),
          ) &&
          hasVisualChild(element)
        )
          report(node, owner, 'descendant')
      } else if (name === 'style' && (inside || shared)) {
        const type = value && checker.getTypeAtLocation(unwrap(value))
        if (type?.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))
          report(node, owner, 'unverifiable')
        else if (styleLayout(value)) report(node, owner, 'internal')
      } else if (shared && name?.endsWith('ClassName'))
        report(node, owner, 'internal')
      if (name === 'children') walk(value, inside || shared, owner)
    }
    function walk(input, inside = false, owner) {
      const node = unwrap(input)
      if (!node) return
      const mode = inside ? 1 : 0
      const modes = visited.get(node) ?? new Set()
      if (modes.has(mode)) return
      modes.add(mode)
      visited.set(node, modes)
      const own = node.getSourceFile() === source ? node : owner
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node
        const shared = boundary(opening.tagName)
        for (const a of opening.attributes.properties) {
          if (ts.isJsxSpreadAttribute(a))
            props(a.expression, inside, shared, own, node)
          else if (a.initializer)
            attribute(
              a,
              a.name.text,
              ts.isJsxExpression(a.initializer)
                ? a.initializer.expression
                : a.initializer,
              inside,
              shared,
              own,
              node,
            )
        }
        if (ts.isJsxElement(node))
          for (const child of node.children)
            walk(
              child,
              inside || shared || forwardsChildren(opening.tagName),
              own,
            )
        // Caller-authored extracted components cannot hide internal layout.
        if (inside && !isShared(opening.tagName))
          for (const body of componentBodies(opening.tagName))
            walk(body, true, own)
        return
      }
      if (ts.isCallExpression(node) && factory(node.expression)) {
        const cloned = factory(node.expression) === 'cloneElement'
        const tag = node.arguments[0]
        const shared = tag && (cloned ? elementBoundary(tag) : boundary(tag))
        props(node.arguments[1], inside, shared, own, node)
        for (const child of node.arguments.slice(cloned ? 0 : 2))
          walk(
            child,
            inside || shared || (!cloned && forwardsChildren(tag)),
            own,
          )
        return
      }
      if (inside && ts.isCallExpression(node)) {
        for (const body of componentBodies(node.expression))
          walk(body, true, own)
      }
      if (
        inside &&
        (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node))
      ) {
        for (const d of symbolAt(node)?.declarations ?? [])
          if (d.initializer && !d.getSourceFile().isDeclarationFile)
            walk(d.initializer, true, own)
      }
      ts.forEachChild(node, (child) => walk(child, inside, own))
    }
    walk(source)
    return findings
  }
  return { inspect, boundary, componentBodies, staticStrings }
}
