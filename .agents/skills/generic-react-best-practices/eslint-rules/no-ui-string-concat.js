import {
  childrenOf,
  isProductionSource,
  stableInitializer,
} from './ast-bindings.js'
import { createContextResolver } from './context-provenance.js'
import { helperRole } from './helper-categories.js'
import { createTranslationResolver } from './translation-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use catalog interpolation for assembled display text and format numeric units centrally',
    },
    schema: [],
    messages: {
      interpolation:
        'Use catalog interpolation for this assembled display text. Numeric signs and units belong to the existing formatter options. [i18n-interpolation]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      /\/shared\/helpers\/formatters\//u.test(context.filename)
    )
      return {}
    const source = context.sourceCode
    const translate = createTranslationResolver(source)
    const resolver = createContextResolver(source, context.filename)
    const presentationHelper = helperRole(context.filename) === 'presentation'
    function containsTranslation(node) {
      return (
        translate(node) || childrenOf(source, node).some(containsTranslation)
      )
    }
    function technical(node) {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (parent.type === 'JSXAttribute')
          return [
            'key',
            'id',
            'className',
            'style',
            'd',
            'href',
            'dataKey',
          ].includes(parent.name.name)
        if (
          parent.type === 'Property' &&
          ['key', 'id', 'className', 'style', 'd', 'href', 'dataKey'].includes(
            parent.key.name,
          )
        )
          return true
        if (parent.type.endsWith('Statement')) break
      }
      return false
    }
    function displayValue(node, seen = new Set()) {
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'CallExpression' &&
        (translate(node) || resolver.contextValue(node.callee))
      )
        return true
      const init = stableInitializer(source, node)
      if (init) return displayValue(init, seen)
      if (node.type === 'ConditionalExpression')
        return (
          displayValue(node.consequent, seen) ||
          displayValue(node.alternate, seen)
        )
      return false
    }
    function displaySite(node) {
      if (presentationHelper) return true
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (parent.type === 'JSXExpressionContainer') return true
        if (parent.type.endsWith('Statement')) return false
      }
      return false
    }
    function containsDisplayValue(node) {
      return (
        displayValue(node) ||
        childrenOf(source, node).some(containsDisplayValue)
      )
    }
    function stringValue(node) {
      if (node.type === 'Literal') return typeof node.value === 'string'
      if (node.type === 'TemplateLiteral') return true
      const services = source.parserServices
      if (!services?.program || !services.esTreeNodeToTSNodeMap) return false
      const checker = services.program.getTypeChecker()
      const type = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      )
      return (type.isUnion() ? type.types : [type]).every(
        (part) => part.flags & ts.TypeFlags.StringLike,
      )
    }
    return {
      TemplateLiteral(node) {
        if (!node.expressions.length || technical(node)) return
        const raw = node.quasis
          .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
          .join('')
        const translated = node.expressions.some(containsTranslation)
        const formatted = node.expressions.filter((expression) =>
          displayValue(expression),
        ).length
        const presentationRange =
          presentationHelper &&
          node.expressions.length >= 2 &&
          /^[\s–—/:().-]+$/u.test(raw)
        const unit =
          /^\s*(?:%|€|k€|M€)\s*$/u.test(raw) &&
          context.filename.endsWith('.tsx')
        const decoratedFormatter =
          formatted > 0 && (node.expressions.length > 1 || /\S/u.test(raw))
        if (translated || decoratedFormatter || presentationRange || unit)
          context.report({ node, messageId: 'interpolation' })
      },
      BinaryExpression(node) {
        if (
          node.operator !== '+' ||
          technical(node) ||
          (node.parent.type === 'BinaryExpression' &&
            node.parent.operator === '+')
        )
          return
        const decoratedDisplay =
          displaySite(node) &&
          containsDisplayValue(node) &&
          (stringValue(node.left) || stringValue(node.right))
        if (containsTranslation(node) || decoratedDisplay)
          context.report({ node, messageId: 'interpolation' })
      },
    }
  },
}
import ts from 'typescript'
