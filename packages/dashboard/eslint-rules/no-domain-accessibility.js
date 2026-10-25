import ts from 'typescript'

const BEHAVIOR_PROPS = new Set([
  'role',
  'tabIndex',
  'autoFocus',
  'onKeyDown',
  'onKeyDownCapture',
  'onKeyUp',
  'onKeyUpCapture',
  'onKeyPress',
  'onKeyPressCapture',
  'onFocus',
  'onFocusCapture',
  'onBlur',
  'onBlurCapture',
  'onOpenAutoFocus',
  'onCloseAutoFocus',
  'onEscapeKeyDown',
  'onFocusOutside',
  'onInteractOutside',
  'onPointerDownOutside',
])
const FOCUS_EVENTS = new Set([
  'keydown',
  'keyup',
  'keypress',
  'focus',
  'blur',
  'focusin',
  'focusout',
])
const isWiring = (name) => name.startsWith('aria-') || BEHAVIOR_PROPS.has(name)
const isPrimitiveLibrary = (name) =>
  name === 'radix-ui' || name.startsWith('@radix-ui/')

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Centralize ARIA, keyboard and focus behavior in shared UI primitives',
    },
    schema: [],
    messages: {
      wiring:
        'Move "{{name}}" into a shared/ui primitive; pass semantic data, labels and business actions instead. [architecture-centralize-accessibility]',
      library:
        'Wrap "{{name}}" in shared/ui instead of importing accessibility primitives here. [architecture-centralize-accessibility]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (
      !filename.includes('/src/') ||
      filename.includes('/src/shared/ui/') ||
      /\/(?:__tests__|generated|__generated__)\//u.test(filename) ||
      /\.(?:test|spec|generated|gen)\.[cm]?[jt]sx?$/u.test(filename)
    )
      return {}
    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap)
      throw new Error('no-domain-accessibility requires typed linting.')
    const checker = services.program.getTypeChecker()

    function report(node, name, messageId = 'wiring') {
      context.report({ node, messageId, data: { name } })
    }

    function inspectProps(node, expression) {
      const argument = services.esTreeNodeToTSNodeMap.get(expression)
      const type = checker.getTypeAtLocation(argument)
      const parts = type.isUnion() ? type.types : [type]
      const reported = new Set()
      const seen = new Set()
      function inspectInitializer(value) {
        if (!value || seen.has(value)) return
        seen.add(value)
        if (
          ts.isParenthesizedExpression(value) ||
          ts.isAsExpression(value) ||
          ts.isSatisfiesExpression(value) ||
          ts.isNonNullExpression(value) ||
          ts.isTypeAssertionExpression(value)
        ) {
          inspectInitializer(value.expression)
        } else if (ts.isConditionalExpression(value)) {
          inspectInitializer(value.whenTrue)
          inspectInitializer(value.whenFalse)
        } else if (ts.isObjectLiteralExpression(value)) {
          for (const property of value.properties) {
            if (ts.isSpreadAssignment(property)) {
              inspectInitializer(property.expression)
              continue
            }
            const key = property.name
            const name =
              key && (ts.isIdentifier(key) || ts.isStringLiteral(key))
                ? key.text
                : undefined
            if (name && isWiring(name) && !reported.has(name)) {
              reported.add(name)
              report(node, name)
            }
          }
        } else if (
          ts.isIdentifier(value) ||
          ts.isPropertyAccessExpression(value)
        ) {
          const symbol = checker.getSymbolAtLocation(value)
          const resolved =
            symbol?.flags & ts.SymbolFlags.Alias
              ? checker.getAliasedSymbol(symbol)
              : symbol
          for (const declaration of resolved?.declarations ?? [])
            inspectInitializer(declaration.initializer)
        }
      }
      // Follow supplied values as well as their type: an explicit native annotation
      // must not hide an authored attribute, while optional external props stay valid.
      inspectInitializer(argument)
      for (const part of parts) {
        for (const property of part.getProperties()) {
          if (!isWiring(property.name) || reported.has(property.name)) continue
          // SVG/HTML library types contain optional wiring even when none was supplied.
          if (
            !property.declarations?.some(
              (declaration) =>
                !services.program.isSourceFileFromExternalLibrary(
                  declaration.getSourceFile(),
                ) &&
                !services.program.isSourceFileDefaultLibrary(
                  declaration.getSourceFile(),
                ),
            )
          )
            continue
          reported.add(property.name)
          report(node, property.name)
        }
      }
    }

    function isDomMember(node) {
      const mapped = services.esTreeNodeToTSNodeMap.get(node.property)
      const symbol = checker.getSymbolAtLocation(mapped)
      return symbol?.declarations?.some((declaration) =>
        /[/\\]lib\.dom\.d\.ts$/u.test(declaration.getSourceFile().fileName),
      )
    }

    function staticString(node) {
      if (!node) return undefined
      if (node.type === 'Literal')
        return typeof node.value === 'string' ? node.value : undefined
      const type = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      )
      return type.isStringLiteral() ? type.value : undefined
    }

    function memberName(node) {
      return node.computed ? staticString(node.property) : node.property.name
    }

    function inspectImport(node) {
      const name = staticString(node.source)
      if (name && isPrimitiveLibrary(name)) report(node.source, name, 'library')
    }

    return {
      ImportDeclaration: inspectImport,
      ExportAllDeclaration: inspectImport,
      ExportNamedDeclaration(node) {
        if (node.source) inspectImport(node)
      },
      ImportExpression: inspectImport,
      JSXAttribute(node) {
        if (typeof node.name.name === 'string' && isWiring(node.name.name))
          report(node, node.name.name)
      },
      JSXSpreadAttribute(node) {
        inspectProps(node, node.argument)
      },
      MemberExpression(node) {
        const name = memberName(node)
        if (
          ([
            'focus',
            'blur',
            'activeElement',
            'tabIndex',
            'autofocus',
            'role',
          ].includes(name) ||
            name?.startsWith('aria') ||
            (name?.startsWith('on') && FOCUS_EVENTS.has(name.slice(2)))) &&
          isDomMember(node)
        )
          report(node, name)
      },
      CallExpression(node) {
        const callable =
          node.callee.type === 'MemberExpression'
            ? node.callee.property
            : node.callee
        const symbol = checker.getSymbolAtLocation(
          services.esTreeNodeToTSNodeMap.get(callable),
        )
        const resolved =
          symbol?.flags & ts.SymbolFlags.Alias
            ? checker.getAliasedSymbol(symbol)
            : symbol
        if (
          ['createElement', 'cloneElement'].includes(resolved?.name) &&
          resolved.declarations?.some((declaration) =>
            /[/\\]@types[/\\]react[/\\]/u.test(
              declaration.getSourceFile().fileName,
            ),
          ) &&
          node.arguments[1] &&
          node.arguments[1].type !== 'SpreadElement'
        )
          inspectProps(node.arguments[1], node.arguments[1])
        if (node.callee.type !== 'MemberExpression') return
        const name = memberName(node.callee)
        if (!isDomMember(node.callee)) return
        const argument = staticString(node.arguments[0])
        const attribute = argument?.toLowerCase()
        if (
          (name === 'addEventListener' || name === 'removeEventListener') &&
          FOCUS_EVENTS.has(argument)
        )
          report(node, `${name}(${argument})`)
        if (
          [
            'setAttribute',
            'getAttribute',
            'removeAttribute',
            'toggleAttribute',
          ].includes(name) &&
          (attribute?.startsWith('aria-') ||
            ['role', 'tabindex', 'autofocus'].includes(attribute))
        )
          report(node, `${name}(${argument})`)
      },
    }
  },
}
