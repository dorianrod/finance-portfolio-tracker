import {
  childrenOf,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

const COLOR =
  /^(?:#[\da-f]{3,8}|(?:rgba?|hsla?|oklch|oklab|lch|lab|color|color-mix)\(.+\)|red|blue|green|white|black|gray|grey|orange|purple|pink|yellow)$/iu
const PALETTE =
  /(?:^|[\s:])(?:bg|text|border|fill|stroke|ring|outline|decoration)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\b|\/)/u
const APPEARANCE =
  /(?:color|fill|stroke|background|accent|border|outline|shadow)/iu

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep literal colors in dedicated theme tokens, including imperative DOM styling',
    },
    schema: [],
    messages: {
      color:
        'Define this color in shared/theme and consume a semantic token or variant. DOM styling and browser theme metadata follow the same boundary. [styling-semantic-colors]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      /\/(?:shared\/theme|assets)\//u.test(context.filename)
    )
      return {}
    const source = context.sourceCode
    const reported = new Set()
    function themeMetadata(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (/meta.*theme-color/u.test(source.getText(node))) return true
      return themeMetadata(stableInitializer(source, node), seen)
    }
    function inspect(input, palette = false, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return
      seen.add(node)
      if (
        node.type === 'Literal' &&
        typeof node.value === 'string' &&
        (COLOR.test(node.value) || (palette && PALETTE.test(node.value)))
      ) {
        if (!reported.has(node)) context.report({ node, messageId: 'color' })
        reported.add(node)
        return
      }
      const init = stableInitializer(source, node)
      if (init) {
        inspect(init, palette, seen)
        return
      }
      if (node.type === 'ConditionalExpression') {
        inspect(node.consequent, palette, seen)
        inspect(node.alternate, palette, seen)
        return
      }
      if (
        [
          'JSXExpressionContainer',
          'ObjectExpression',
          'ArrayExpression',
          'Property',
          'TemplateLiteral',
          'TemplateElement',
          'LogicalExpression',
        ].includes(node.type)
      ) {
        if (
          node.type === 'TemplateElement' &&
          palette &&
          PALETTE.test(node.value.raw) &&
          !reported.has(node)
        ) {
          context.report({ node, messageId: 'color' })
          reported.add(node)
        }
        for (const child of childrenOf(source, node))
          inspect(child, palette, seen)
      }
    }
    return {
      JSXAttribute(node) {
        if (node.name.name === 'className') inspect(node.value, true)
        else if (node.name.name === 'style' || APPEARANCE.test(node.name.name))
          inspect(node.value)
      },
      Property(node) {
        if (APPEARANCE.test(node.key.name ?? node.key.value ?? ''))
          inspect(node.value)
      },
      AssignmentExpression(node) {
        if (
          node.left.type === 'MemberExpression' &&
          APPEARANCE.test(
            node.left.property.name ?? node.left.property.value ?? '',
          )
        )
          inspect(node.right)
      },
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return
        const method = node.callee.property.name ?? node.callee.property.value
        const name = node.arguments[0]?.value
        if (
          method === 'setProperty' &&
          typeof name === 'string' &&
          APPEARANCE.test(name)
        )
          inspect(node.arguments[1])
        if (
          method === 'setAttribute' &&
          typeof name === 'string' &&
          (APPEARANCE.test(name) ||
            (name === 'content' && themeMetadata(node.callee.object)))
        )
          inspect(node.arguments[1])
      },
    }
  },
}
