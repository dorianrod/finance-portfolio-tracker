import ts from 'typescript'

const BROWSER_GLOBALS = new Set([
  'window',
  'self',
  'document',
  'navigator',
  'location',
  'history',
  'screen',
  'localStorage',
  'sessionStorage',
  'visualViewport',
  'matchMedia',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'ResizeObserver',
  'IntersectionObserver',
  'MutationObserver',
  'fetch',
  'innerWidth',
  'innerHeight',
  'outerWidth',
  'outerHeight',
  'devicePixelRatio',
  'scrollX',
  'scrollY',
  'pageXOffset',
  'pageYOffset',
])
const DOM_EFFECTS = new Set([
  'focus',
  'blur',
  'click',
  'append',
  'appendChild',
  'prepend',
  'remove',
  'removeChild',
  'replaceChild',
  'replaceChildren',
  'setAttribute',
  'removeAttribute',
  'toggleAttribute',
  'addEventListener',
  'removeEventListener',
  'setProperty',
  'removeProperty',
  'insertAdjacentElement',
  'insertAdjacentHTML',
  'insertAdjacentText',
  'scroll',
  'scrollTo',
  'scrollBy',
  'scrollIntoView',
  'getBoundingClientRect',
  'getClientRects',
])
const DOM_MEASUREMENTS = new Set([
  'clientWidth',
  'clientHeight',
  'offsetWidth',
  'offsetHeight',
  'offsetLeft',
  'offsetTop',
  'scrollWidth',
  'scrollHeight',
  'scrollLeft',
  'scrollTop',
])
const isDomSymbol = (symbol) =>
  symbol?.declarations?.some((declaration) =>
    /[/\\]lib\.dom\.d\.ts$/u.test(declaration.getSourceFile().fileName),
  )

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Pass browser measurements into pure presenters and calculators instead of reading or mutating the DOM',
    },
    schema: [],
    messages: {
      browserContext:
        'Pass browser data into this helper as explicit inputs; keep "{{name}}" at the component or service boundary. [architecture-extract-component-calculations]',
      domEffect:
        'Keep DOM effects and measurements outside pure helpers ({{name}}); pass values in and apply the result at the UI boundary. [architecture-extract-component-calculations]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (
      !/\/src\/.+\/helpers\/(?:presenters|calculators)\//u.test(filename) ||
      /\/(?:__tests__|generated|__generated__)\//u.test(filename) ||
      /\.(?:test|spec|stories|generated|gen|d)\.[cm]?[jt]sx?$/u.test(filename)
    )
      return {}
    const services = context.sourceCode.parserServices
    if (!services.program)
      throw new Error('no-browser-in-pure-helpers requires typed linting.')
    const checker = services.program.getTypeChecker()
    const mapped = (node) => services.esTreeNodeToTSNodeMap.get(node)
    function symbol(node) {
      let value = checker.getSymbolAtLocation(mapped(node))
      if (value?.flags & ts.SymbolFlags.Alias)
        value = checker.getAliasedSymbol(value)
      return value
    }
    function memberSymbol(node) {
      const type = checker.getTypeAtLocation(mapped(node.property))
      const name = node.computed
        ? type.isStringLiteral()
          ? type.value
          : undefined
        : node.property.name
      return {
        name,
        value:
          name &&
          checker.getPropertyOfType(
            checker.getNonNullableType(
              checker.getTypeAtLocation(mapped(node.object)),
            ),
            name,
          ),
      }
    }
    function report(node, name, messageId) {
      context.report({ node, messageId, data: { name } })
    }
    return {
      Identifier(node) {
        if (!BROWSER_GLOBALS.has(node.name)) return
        const value = symbol(node)
        // A DOM type, a locally shadowed variable and a property key are not global reads.
        if (!isDomSymbol(value) || !(value.flags & ts.SymbolFlags.Value)) return
        if (
          (node.parent.type === 'MemberExpression' &&
            node.parent.property === node) ||
          (node.parent.type === 'Property' &&
            node.parent.key === node &&
            !node.parent.shorthand)
        )
          return
        let parent = node.parent
        while (parent && parent.type !== 'Program') {
          if (
            parent.type.startsWith('TS') &&
            ![
              'TSAsExpression',
              'TSSatisfiesExpression',
              'TSNonNullExpression',
              'TSTypeAssertion',
            ].includes(parent.type)
          )
            return
          parent = parent.parent
        }
        report(node, node.name, 'browserContext')
      },
      MemberExpression(node) {
        if (
          (node.parent.type === 'AssignmentExpression' &&
            node.parent.left === node) ||
          node.parent.type === 'UpdateExpression'
        )
          return
        const { name, value } = memberSymbol(node)
        if (!isDomSymbol(value)) return
        if (BROWSER_GLOBALS.has(name)) report(node, name, 'browserContext')
        else if (DOM_MEASUREMENTS.has(name)) report(node, name, 'domEffect')
      },
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return
        const { name, value } = memberSymbol(node.callee)
        if (DOM_EFFECTS.has(name) && isDomSymbol(value))
          report(node, name, 'domEffect')
      },
      AssignmentExpression(node) {
        if (node.left.type !== 'MemberExpression') return
        const { name, value } = memberSymbol(node.left)
        if (isDomSymbol(value)) report(node, name, 'domEffect')
      },
      UpdateExpression(node) {
        if (node.argument.type !== 'MemberExpression') return
        const { name, value } = memberSymbol(node.argument)
        if (isDomSymbol(value)) report(node, name, 'domEffect')
      },
    }
  },
}
