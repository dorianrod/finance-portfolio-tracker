import { dirname, resolve } from 'node:path'

import ts from 'typescript'

import {
  isLayoutClass,
  isLayoutProperty,
  splitOutside,
} from './styling-layout.js'

const VISUAL_PROPS = new Set([
  'color',
  'fill',
  'fillOpacity',
  'fillRule',
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeMiterlimit',
  'opacity',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'letterSpacing',
  'wordSpacing',
  'textDecoration',
  'textAnchor',
  'dominantBaseline',
  'alignmentBaseline',
  'paintOrder',
  'filter',
  'radius',
  'angle',
  'stopColor',
  'stopOpacity',
  'floodColor',
  'floodOpacity',
  'lightingColor',
  'clipRule',
  'vectorEffect',
  'shapeRendering',
  'colorInterpolation',
  'colorInterpolationFilters',
  'bgColor',
  'isAnimationActive',
  'animationBegin',
  'animationDuration',
  'animationEasing',
])
const CHART_OBJECTS = new Set([
  'tick',
  'dot',
  'activeDot',
  'label',
  'labelLine',
  'axisLine',
  'tickLine',
  'cursor',
  'background',
])
const GEOMETRY_PROPS = new Set(['x', 'y', 'cx', 'cy', 'dx', 'dy', 'r'])
const CHART_DATA_PROPS = new Set([
  'value',
  'dataKey',
  'formatter',
  'name',
  'unit',
  'offset',
  'index',
  'payload',
])
const MUTATING_METHODS = new Set([
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'fill',
  'copyWithin',
  'set',
  'add',
  'delete',
  'clear',
])
const CLASS_LIBRARIES = new Set(['clsx', 'classnames', 'tailwind-merge'])
const UNKNOWN_PART = '\ufffc'

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

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Keep visual styling in shared/ui and only layout in application code',
    },
    schema: [],
    messages: {
      nonLayoutClass:
        'Move non-layout classes {{names}} into a shared/ui primitive; keep only layout here and expose semantic variants. [styling-centralize-in-shared-ui]',
      nonLayoutStyle:
        'Move visual properties {{names}} into a shared/ui primitive; pass semantic data or variants instead. [styling-centralize-in-shared-ui]',
      unverifiableStyle:
        'Cannot statically verify {{names}}. Review this styling and centralize visual choices in shared/ui; only layout is allowed here. [styling-centralize-in-shared-ui]',
      outsideStylesheet:
        'Move stylesheet "{{names}}" into shared/ui or the design-system infrastructure (src/index.css, shared/theme). [styling-centralize-in-shared-ui]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const sourceIndex = filename.lastIndexOf('/src/')
    if (
      sourceIndex < 0 ||
      /\/(?:__tests__|generated|__generated__)\//u.test(filename) ||
      /\.(?:test|spec|generated|gen)\.[cm]?[jt]sx?$/u.test(filename)
    )
      return {}
    const sourceRoot = filename.slice(0, sourceIndex + 5)

    function inspectImport(node) {
      const name = node.source?.value
      if (
        typeof name !== 'string' ||
        !/\.(?:css|scss|sass|less|styl)(?:[?#].*)?$/u.test(name) ||
        !/^(?:\.|@\/|\/)/u.test(name)
      )
        return
      const cleanName = name.split(/[?#]/u)[0]
      const target = resolve(
        name.startsWith('@/') ? sourceRoot : dirname(filename),
        name.startsWith('@/') ? cleanName.slice(2) : cleanName,
      ).replaceAll('\\', '/')
      if (
        target === `${sourceRoot}index.css` ||
        target.startsWith(`${sourceRoot}shared/theme/`) ||
        target.startsWith(`${sourceRoot}shared/ui/`)
      )
        return
      context.report({
        node,
        messageId: 'outsideStylesheet',
        data: { names: name },
      })
    }

    const imports = {
      ImportDeclaration: inspectImport,
      ExportAllDeclaration: inspectImport,
      ExportNamedDeclaration(node) {
        if (node.source) inspectImport(node)
      },
      ImportExpression: inspectImport,
    }
    if (
      filename.startsWith(`${sourceRoot}shared/ui/`) ||
      filename.startsWith(`${sourceRoot}shared/theme/`)
    )
      return imports

    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap)
      throw new Error('no-domain-styling requires typed linting.')
    const checker = services.program.getTypeChecker()
    const mapped = (node) => services.esTreeNodeToTSNodeMap.get(node)
    const mutations = new Map()

    function symbolAt(node) {
      const keyType = ts.isElementAccessExpression(node)
        ? checker.getTypeAtLocation(node.argumentExpression)
        : undefined
      const key = keyType?.isStringLiteral() ? keyType.value : undefined
      const symbol =
        ts.isShorthandPropertyAssignment(node.parent) &&
        node.parent.name === node
          ? checker.getShorthandAssignmentValueSymbol(node.parent)
          : (checker.getSymbolAtLocation(node) ??
            (ts.isElementAccessExpression(node) && key !== undefined
              ? checker.getPropertyOfType(
                  checker.getTypeAtLocation(node.expression),
                  key,
                )
              : undefined))
      return symbol?.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    }

    function rootSymbol(input) {
      let node = unwrap(input)
      while (
        ts.isPropertyAccessExpression(node) ||
        ts.isElementAccessExpression(node)
      )
        node = unwrap(node.expression)
      return ts.isIdentifier(node) ? symbolAt(node) : undefined
    }

    function mutatedSymbols(source) {
      if (mutations.has(source)) return mutations.get(source)
      const changed = new Set()
      if (source.isDeclarationFile) return changed
      const aliases = []
      function mark(node) {
        const symbol = rootSymbol(node)
        if (symbol) changed.add(symbol)
      }
      function walk(node) {
        if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
          node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
        )
          mark(node.left)
        if (ts.isDeleteExpression(node)) mark(node.expression)
        if (
          (ts.isPrefixUnaryExpression(node) ||
            ts.isPostfixUnaryExpression(node)) &&
          [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(
            node.operator,
          )
        )
          mark(node.operand)
        if (
          ts.isVariableDeclaration(node) &&
          ts.isIdentifier(node.name) &&
          node.initializer
        ) {
          const origin = rootSymbol(node.initializer)
          if (origin) {
            const type = checker.getTypeAtLocation(node.initializer)
            const parts = type.isUnion() ? type.types : [type]
            if (
              parts.some(
                (part) =>
                  part.flags &
                  (ts.TypeFlags.Object |
                    ts.TypeFlags.Any |
                    ts.TypeFlags.Unknown |
                    ts.TypeFlags.TypeParameter),
              )
            )
              aliases.push([symbolAt(node.name), origin])
          }
        }
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression)
        ) {
          const { expression: receiver, name } = node.expression
          if (MUTATING_METHODS.has(name.text)) mark(receiver)
          if (
            ts.isIdentifier(receiver) &&
            ['Object', 'Reflect'].includes(receiver.text) &&
            [
              'assign',
              'defineProperty',
              'defineProperties',
              'setPrototypeOf',
              'set',
              'deleteProperty',
            ].includes(name.text) &&
            node.arguments[0]
          )
            mark(node.arguments[0])
        }
        ts.forEachChild(node, walk)
      }
      walk(source)
      // A mutation through a const alias also changes the original object/array.
      let previousSize
      do {
        previousSize = changed.size
        for (const [alias, origin] of aliases)
          if (changed.has(alias)) changed.add(origin)
      } while (changed.size !== previousSize)
      mutations.set(source, changed)
      return changed
    }

    function isMutated(node) {
      if (
        !ts.isIdentifier(node) &&
        !ts.isPropertyAccessExpression(node) &&
        !ts.isElementAccessExpression(node)
      )
        return false
      const symbol = rootSymbol(node)
      return (
        symbol?.declarations?.some((declaration) =>
          mutatedSymbols(declaration.getSourceFile()).has(symbol),
        ) ?? false
      )
    }

    function isAbsent(node) {
      if (!node) return false
      const type = checker.getTypeAtLocation(node)
      const parts = type.isUnion() ? type.types : [type]
      return parts.every(
        (part) =>
          part.flags &
          (ts.TypeFlags.Null |
            ts.TypeFlags.Undefined |
            ts.TypeFlags.Void |
            ts.TypeFlags.Never),
      )
    }

    function initializer(node, visited = new Set()) {
      if (visited.has(node)) return undefined
      visited.add(node)
      const symbol = symbolAt(node)
      for (const declaration of symbol?.declarations ?? []) {
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.parent.flags & ts.NodeFlags.Const
        )
          return declaration.initializer
        if (ts.isPropertyAssignment(declaration)) return declaration.initializer
        if (
          ts.isBindingElement(declaration) &&
          !declaration.dotDotDotToken &&
          ts.isObjectBindingPattern(declaration.parent)
        ) {
          const owner = declaration.parent.parent
          const name = propertyName(
            declaration.propertyName ?? declaration.name,
          )
          let object = unwrap(owner.initializer)
          const seen = new Set()
          while (
            object &&
            !ts.isObjectLiteralExpression(object) &&
            !seen.has(object) &&
            !isMutated(object)
          ) {
            seen.add(object)
            object = unwrap(initializer(object, visited))
          }
          if (object && ts.isObjectLiteralExpression(object)) {
            const property = object.properties.findLast(
              (entry) => entry.name && propertyName(entry.name) === name,
            )
            if (property && ts.isPropertyAssignment(property))
              return property.initializer
            if (property && ts.isShorthandPropertyAssignment(property))
              return property.name
            if (!property) return declaration.initializer
          }
        }
      }
      return undefined
    }

    function fromLibrary(node, library, seen = new Set()) {
      if (!node || seen.has(node)) return false
      seen.add(node)
      const symbol = checker.getSymbolAtLocation(node)
      const declarations = [
        ...(symbol?.declarations ?? []),
        ...(symbolAt(node)?.declarations ?? []),
      ]
      for (const declaration of declarations) {
        let parent = declaration
        while (parent && !ts.isSourceFile(parent)) {
          if (
            ts.isImportDeclaration(parent) &&
            parent.moduleSpecifier.text === library
          )
            return true
          parent = parent.parent
        }
        const file = declaration.getSourceFile().fileName.replaceAll('\\', '/')
        if (
          file.includes(`/node_modules/${library}/`) ||
          (library === 'react' && file.includes('/node_modules/@types/react/'))
        )
          return true
      }
      const value = initializer(node)
      return value ? fromLibrary(unwrap(value), library, seen) : false
    }

    function staticStrings(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node) || seen.size > 32) return null
      if (isMutated(node)) return null
      seen = new Set(seen).add(node)
      if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node))
        return [node.text]
      const type = checker.getTypeAtLocation(node)
      const parts = type.isUnion() ? type.types : [type]
      if (
        parts.length &&
        parts.every((part) => part.isStringLiteral() || part.isNumberLiteral())
      )
        return parts.map((part) => String(part.value))
      if (ts.isConditionalExpression(node)) {
        const left = staticStrings(node.whenTrue, seen)
        const right = staticStrings(node.whenFalse, seen)
        return left && right && left.length + right.length <= 64
          ? [...left, ...right]
          : null
      }
      if (ts.isTemplateExpression(node)) {
        let values = [node.head.text]
        for (const span of node.templateSpans) {
          const strings = staticStrings(span.expression, seen)
          if (!strings || values.length * strings.length > 64) return null
          values = values.flatMap((value) =>
            strings.map((part) => value + part + span.literal.text),
          )
        }
        return values
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.PlusToken
      ) {
        const left = staticStrings(node.left, seen)
        const right = staticStrings(node.right, seen)
        return left && right && left.length * right.length <= 64
          ? left.flatMap((a) => right.map((b) => a + b))
          : null
      }
      const value = initializer(node)
      return value ? staticStrings(value, seen) : null
    }

    function propertyName(node) {
      if (
        ts.isIdentifier(node) ||
        ts.isStringLiteralLike(node) ||
        ts.isNumericLiteral(node)
      )
        return node.text
      if (ts.isComputedPropertyName(node)) {
        const names = staticStrings(node.expression)
        if (names?.length === 1) return names[0]
      }
      return undefined
    }

    function propertyMode(name, visual) {
      if (name === 'className') return 'classes'
      if (name === 'style' || (visual === 'chart' && name.endsWith('Style')))
        return 'style'
      const canonical = name.replace(/-([a-z])/gu, (_, letter) =>
        letter.toUpperCase(),
      )
      if (visual && VISUAL_PROPS.has(canonical)) return 'visual'
      if (visual === 'chart' && CHART_OBJECTS.has(name)) return 'chart'
      if (!visual && ['color', 'accent', 'tone'].includes(name))
        return 'semantic'
      return null
    }

    function classify(node, jsx = false) {
      node = unwrap(node)
      if (!node) return null
      if (ts.isJsxElement(node))
        return classify(node.openingElement.tagName, true)
      if (ts.isJsxSelfClosingElement(node)) return classify(node.tagName, true)
      if (
        ts.isStringLiteralLike(node) ||
        (jsx && ts.isIdentifier(node) && /^[a-z]/u.test(node.text))
      )
        return 'native'
      if (fromLibrary(node, 'recharts')) return 'chart'
      const value = initializer(node)
      if (value && value !== node) {
        const unwrapped = unwrap(value)
        if (ts.isJsxElement(unwrapped) || ts.isJsxSelfClosingElement(unwrapped))
          return classify(unwrapped)
      }
      return null
    }

    function isReactFactory(node, seen = new Set()) {
      node = unwrap(node)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        fromLibrary(node, 'react') &&
        ['createElement', 'cloneElement'].includes(symbolAt(node)?.name)
      )
        return true
      const value = initializer(node)
      return value ? isReactFactory(value, seen) : false
    }

    function analyze(reportNode, input, mode, label, visual) {
      const result = {
        nonLayoutClass: new Set(),
        nonLayoutStyle: new Set(),
        unverifiableStyle: new Set(),
      }
      let visits = 0
      function opaque(name) {
        result.unverifiableStyle.add(name || 'spread props')
      }
      function classes(value, name) {
        const tokens = splitOutside(value, /\s/u)
        if (!tokens) {
          opaque(name)
          return
        }
        for (const token of tokens.filter(Boolean)) {
          if (token.includes(UNKNOWN_PART)) opaque(name)
          else if (!isLayoutClass(token)) result.nonLayoutClass.add(token)
        }
      }

      function semanticValue(value, name) {
        if (
          /^(?:#[\da-f]{3,8}$|(?:rgba?|hsla?|oklch|oklab|lch|lab|color|color-mix|var)\()/iu.test(
            value,
          )
        ) {
          result.nonLayoutStyle.add(name)
          return
        }
        for (const token of splitOutside(value, /\s/u) ?? []) {
          const utility = splitOutside(token, /:/u)
            ?.at(-1)
            ?.replace(/^!|!$/gu, '')
          if (
            /^(?:text|bg|border|rounded|shadow|font|ring|outline|decoration|fill|stroke)-/u.test(
              utility ?? '',
            )
          )
            result.nonLayoutClass.add(token)
        }
      }

      function inspectProperty(name, value, kind, path, seen) {
        const key = path ? `${path}.${name}` : name
        if (value && isAbsent(value)) return
        if (kind === 'props') {
          const next = propertyMode(name, visual)
          if (next === 'visual') result.nonLayoutStyle.add(key)
          else if (next) {
            if (value) inspect(value, next, key, seen)
            else opaque(key)
          }
        } else if (kind === 'classes') {
          if (
            value?.kind !== ts.SyntaxKind.FalseKeyword &&
            value?.kind !== ts.SyntaxKind.NullKeyword
          )
            classes(name, path)
        } else if (name === 'className' && kind === 'chart')
          inspect(value, 'classes', key, seen)
        else if (name === 'style' && kind === 'chart')
          inspect(value, 'style', key, seen)
        else if (
          isLayoutProperty(name) ||
          (kind === 'chart' && GEOMETRY_PROPS.has(name))
        )
          return
        else if (
          kind === 'chart' &&
          (/^on[A-Z]|^data-|^aria-/u.test(name) ||
            name === 'id' ||
            CHART_DATA_PROPS.has(name))
        )
          return
        else result.nonLayoutStyle.add(key)
      }

      function inspectType(type, kind, path, location, seen = new Set()) {
        if (seen.has(type)) {
          opaque(path)
          return
        }
        seen = new Set(seen).add(type)
        if (type.isUnion()) {
          for (const part of type.types)
            inspectType(part, kind, path, location, seen)
          return
        }
        if (
          type.flags &
          (ts.TypeFlags.Null |
            ts.TypeFlags.Undefined |
            ts.TypeFlags.Void |
            ts.TypeFlags.Never |
            ts.TypeFlags.BooleanLike)
        )
          return
        if (kind === 'classes' && type.isStringLiteral()) {
          classes(type.value, path)
          return
        }
        if (kind === 'semantic') {
          if (type.isStringLiteral()) semanticValue(type.value, path)
          return
        }
        if (!(type.flags & ts.TypeFlags.Object)) {
          opaque(path)
          return
        }
        if (kind === 'classes') {
          opaque(path)
          return
        }
        if (kind === 'chart' && type.getCallSignatures().length) return
        if (
          kind === 'chart' &&
          ['ReactElement', 'Element'].includes(type.getSymbol()?.name) &&
          type
            .getSymbol()
            .declarations?.some((declaration) =>
              /[/\\]@types[/\\]react[/\\]/u.test(
                declaration.getSourceFile().fileName,
              ),
            )
        )
          return
        if (type.getStringIndexType() || type.getNumberIndexType()) opaque(path)
        for (const property of type.getProperties()) {
          const name = property.name
          const key = path ? `${path}.${name}` : name
          const next = kind === 'props' ? propertyMode(name, visual) : null
          if (kind === 'props' && !next) continue
          if (next === 'semantic') {
            inspectType(
              checker.getTypeOfSymbolAtLocation(property, location),
              next,
              key,
              location,
              seen,
            )
            continue
          }
          if (kind === 'chart' && CHART_DATA_PROPS.has(name)) continue
          if (
            kind !== 'props' &&
            (isLayoutProperty(name) ||
              (kind === 'chart' && GEOMETRY_PROPS.has(name)))
          )
            continue
          // Optional fields in React/CSS types describe possibilities, not authored styles.
          if (property.flags & ts.SymbolFlags.Optional) {
            opaque(kind === 'props' ? key : path)
            continue
          }
          if (next && next !== 'visual') {
            inspectType(
              checker.getTypeOfSymbolAtLocation(property, location),
              next,
              key,
              location,
              seen,
            )
          } else result.nonLayoutStyle.add(key)
        }
      }

      function inspect(inputNode, kind, path, seen = new Set()) {
        const node = unwrap(inputNode)
        if (!node) return
        if (++visits > 512 || seen.has(node)) {
          opaque(path)
          return
        }
        seen = new Set(seen).add(node)
        if (
          node.kind === ts.SyntaxKind.NullKeyword ||
          node.kind === ts.SyntaxKind.FalseKeyword ||
          node.kind === ts.SyntaxKind.TrueKeyword ||
          isAbsent(node)
        )
          return
        if (isMutated(node)) {
          if (kind !== 'semantic') opaque(path)
          return
        }
        if (kind === 'semantic') {
          const values = staticStrings(node)
          if (values) for (const value of values) semanticValue(value, path)
          else inspectType(checker.getTypeAtLocation(node), kind, path, node)
          return
        }
        if (
          kind === 'chart' &&
          (path === 'label' || path.endsWith('.label')) &&
          (ts.isStringLiteralLike(node) ||
            ts.isNumericLiteral(node) ||
            checker.getTypeAtLocation(node).flags &
              (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike))
        )
          return
        if (ts.isConditionalExpression(node)) {
          inspect(node.whenTrue, kind, path, seen)
          inspect(node.whenFalse, kind, path, seen)
          return
        }
        if (ts.isSpreadElement(node)) {
          inspect(node.expression, kind, path, seen)
          return
        }
        if (ts.isBinaryExpression(node)) {
          if (
            [
              ts.SyntaxKind.AmpersandAmpersandToken,
              ts.SyntaxKind.BarBarToken,
              ts.SyntaxKind.QuestionQuestionToken,
            ].includes(node.operatorToken.kind)
          ) {
            if (
              node.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken
            )
              inspect(node.left, kind, path, seen)
            inspect(node.right, kind, path, seen)
            return
          }
        }
        if (kind === 'classes') {
          const strings = staticStrings(node)
          if (strings) {
            for (const value of strings) classes(value, path)
            return
          }
          if (ts.isTemplateExpression(node)) {
            let values = [node.head.text]
            for (const span of node.templateSpans) {
              const strings = staticStrings(span.expression)
              const parts =
                strings && values.length * strings.length <= 64
                  ? strings
                  : [UNKNOWN_PART]
              values = values.flatMap((value) =>
                parts.map((part) => value + part + span.literal.text),
              )
            }
            for (const value of values) classes(value, path)
            return
          }
          if (
            ts.isBinaryExpression(node) &&
            node.operatorToken.kind === ts.SyntaxKind.PlusToken
          ) {
            const left =
              staticStrings(node.left)?.join(UNKNOWN_PART) ?? UNKNOWN_PART
            const right =
              staticStrings(node.right)?.join(UNKNOWN_PART) ?? UNKNOWN_PART
            classes(left + right, path)
            return
          }
          if (ts.isArrayLiteralExpression(node)) {
            for (const element of node.elements)
              inspect(
                ts.isSpreadElement(element) ? element.expression : element,
                kind,
                path,
                seen,
              )
            return
          }
          if (ts.isCallExpression(node)) {
            if (
              [...CLASS_LIBRARIES].some((library) =>
                fromLibrary(node.expression, library),
              )
            ) {
              for (const argument of node.arguments)
                inspect(argument, kind, path, seen)
              return
            }
            if (
              ts.isPropertyAccessExpression(node.expression) &&
              node.expression.name.text === 'join' &&
              (checker.isArrayType(
                checker.getTypeAtLocation(node.expression.expression),
              ) ||
                checker.isTupleType(
                  checker.getTypeAtLocation(node.expression.expression),
                )) &&
              staticStrings(node.arguments[0])?.every((value) =>
                /^\s+$/u.test(value),
              )
            ) {
              let array = unwrap(node.expression.expression)
              if (
                ts.isCallExpression(array) &&
                ts.isPropertyAccessExpression(array.expression) &&
                array.expression.name.text === 'filter' &&
                array.arguments.length === 1 &&
                ts.isIdentifier(array.arguments[0]) &&
                array.arguments[0].text === 'Boolean'
              )
                array = array.expression.expression
              inspect(array, kind, path, seen)
              return
            }
          }
        }
        if (
          kind === 'chart' &&
          (ts.isJsxElement(node) ||
            ts.isJsxSelfClosingElement(node) ||
            ts.isArrowFunction(node) ||
            ts.isFunctionExpression(node))
        )
          return
        if (ts.isObjectLiteralExpression(node)) {
          for (const property of node.properties) {
            if (ts.isSpreadAssignment(property)) {
              inspect(property.expression, kind, path, seen)
              continue
            }
            const name = propertyName(property.name)
            if (!name) {
              opaque(path)
              continue
            }
            const value = ts.isPropertyAssignment(property)
              ? property.initializer
              : ts.isShorthandPropertyAssignment(property)
                ? property.name
                : undefined
            inspectProperty(name, value, kind, path, seen)
          }
          return
        }
        const value = initializer(node)
        if (value) {
          inspect(value, kind, path, seen)
          return
        }
        inspectType(checker.getTypeAtLocation(node), kind, path, node)
      }

      inspect(input, mode, label)
      for (const [messageId, names] of Object.entries(result)) {
        if (names.size)
          context.report({
            node: reportNode,
            messageId,
            data: {
              names: [...names]
                .sort()
                .map((name) => `"${name}"`)
                .join(', '),
            },
          })
      }
    }

    function staticText(node) {
      if (!node) return undefined
      const type = checker.getTypeAtLocation(mapped(node))
      return type.isStringLiteral() ? type.value : undefined
    }

    function memberName(node) {
      return node.computed ? staticText(node.property) : node.property.name
    }

    function domMember(node) {
      const name = memberName(node)
      return (
        name &&
        checker
          .getPropertyOfType(
            checker.getNonNullableType(
              checker.getTypeAtLocation(mapped(node.object)),
            ),
            name,
          )
          ?.declarations?.some((declaration) =>
            /[/\\]lib\.dom\.d\.ts$/u.test(declaration.getSourceFile().fileName),
          )
      )
    }

    function domType(node, name) {
      const type = checker.getTypeAtLocation(mapped(node))
      return (type.isUnion() ? type.types : [type]).some(
        (part) =>
          part.getSymbol()?.name === name &&
          part
            .getSymbol()
            .declarations?.some((declaration) =>
              /[/\\]lib\.dom\.d\.ts$/u.test(
                declaration.getSourceFile().fileName,
              ),
            ),
      )
    }

    function classListTarget(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name.text === 'classList' &&
        symbolAt(node)?.declarations?.some((declaration) =>
          /[/\\]lib\.dom\.d\.ts$/u.test(declaration.getSourceFile().fileName),
        )
      )
        return true
      return classListTarget(initializer(node), seen)
    }

    function reportImperative(node, name, unknown = false) {
      context.report({
        node,
        messageId: unknown ? 'unverifiableStyle' : 'nonLayoutStyle',
        data: { names: JSON.stringify(name) },
      })
    }

    function inspectStyleText(node, value) {
      const text = staticText(value)
      const declarations = text === undefined ? null : splitOutside(text, /;/u)
      if (!declarations) {
        reportImperative(node, 'CSS declaration text', true)
        return
      }
      const visual = new Set()
      for (const declaration of declarations.filter((entry) => entry.trim())) {
        const parts = splitOutside(declaration, /:/u)
        const name = parts?.[0].trim()
        if (!name || parts.length < 2 || !/^[\w-]+$/u.test(name)) {
          reportImperative(node, 'CSS declaration text', true)
          return
        }
        if (!isLayoutProperty(name)) visual.add(name)
      }
      if (visual.size) reportImperative(node, [...visual].sort().join(', '))
    }

    function inspectStyleWrite(node, target, value) {
      if (target.type !== 'MemberExpression') return
      const name = memberName(target)
      if (domType(target.object, 'CSSStyleDeclaration')) {
        if (name === 'cssText') inspectStyleText(node, value)
        else if (!name || !isLayoutProperty(name))
          reportImperative(node, name ?? 'dynamic style property', !name)
      } else if (domMember(target)) {
        if (name === 'style') inspectStyleText(node, value)
        else if (name === 'className' && value)
          analyze(node, mapped(value), 'classes', 'className', false)
      }
    }

    function inspectDomCall(node) {
      const target = node.callee
      if (target.type !== 'MemberExpression' || !domMember(target)) return
      const name = memberName(target)
      if (
        ['setProperty', 'removeProperty'].includes(name) &&
        domType(target.object, 'CSSStyleDeclaration')
      ) {
        const property = staticText(node.arguments[0])
        if (!property || !isLayoutProperty(property))
          reportImperative(
            node,
            property ?? 'dynamic style property',
            !property,
          )
      } else if (name === 'setAttribute') {
        const attribute = staticText(node.arguments[0])?.toLowerCase()
        if (attribute === 'style') inspectStyleText(node, node.arguments[1])
        else if (attribute === 'class' && node.arguments[1])
          analyze(node, mapped(node.arguments[1]), 'classes', 'class', false)
        else if (
          VISUAL_PROPS.has(
            attribute?.replace(/-([a-z])/gu, (_, letter) =>
              letter.toUpperCase(),
            ),
          )
        )
          reportImperative(node, attribute)
      } else if (
        ['add', 'remove', 'toggle', 'replace'].includes(name) &&
        classListTarget(mapped(target.object))
      ) {
        for (const argument of node.arguments) {
          const type = checker.getTypeAtLocation(mapped(argument))
          if (!(type.flags & ts.TypeFlags.BooleanLike))
            analyze(argument, mapped(argument), 'classes', 'classList', false)
        }
      }
    }

    return {
      ...imports,
      AssignmentExpression(node) {
        inspectStyleWrite(node, node.left, node.right)
      },
      UpdateExpression(node) {
        inspectStyleWrite(node, node.argument)
      },
      JSXOpeningElement(node) {
        const visual = classify(mapped(node.name), true)
        for (const attribute of node.attributes) {
          if (attribute.type === 'JSXSpreadAttribute') {
            analyze(attribute, mapped(attribute.argument), 'props', '', visual)
            continue
          }
          const name = attribute.name.name
          if (typeof name !== 'string') continue
          const mode = propertyMode(name, visual)
          if (mode === 'visual') {
            if (
              attribute.value?.type === 'JSXExpressionContainer' &&
              isAbsent(mapped(attribute.value.expression))
            )
              continue
            context.report({
              node: attribute,
              messageId: 'nonLayoutStyle',
              data: { names: `"${name}"` },
            })
          } else if (mode && attribute.value) {
            const value =
              attribute.value.type === 'JSXExpressionContainer'
                ? attribute.value.expression
                : attribute.value
            analyze(attribute, mapped(value), mode, name, visual)
          }
        }
      },
      CallExpression(node) {
        inspectDomCall(node)
        const call = mapped(node)
        if (!isReactFactory(call.expression) || !call.arguments[1]) return
        analyze(
          node.arguments[1],
          call.arguments[1],
          'props',
          '',
          classify(call.arguments[0]),
        )
      },
    }
  },
}
