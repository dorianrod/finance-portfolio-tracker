import { helperRole } from './helper-categories.js'

const USER_FACING_ATTRIBUTES = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'description',
  'detail',
  'empty',
  'emptyMessage',
  'eyebrow',
  'label',
  'loadingMessage',
  'message',
  'name',
  'note',
  'placeholder',
  'text',
  'title',
  'tooltip',
])

const USER_FACING_PROPERTIES = new Set([
  'description',
  'detail',
  'emptyMessage',
  'eyebrow',
  'label',
  'loadingMessage',
  'message',
  'metricLabel',
  'text',
  'title',
  'tooltip',
])

const hasWords = (value) => /[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(value)
const looksTechnical = (value) =>
  /^(?:var\(|#|(?:[a-z]+:)?(?:bg|border|font|text|from|to|rounded|p[trblxy]?)-)/.test(
    value,
  ) ||
  (/\b(?:bg|border|font|text)-/.test(value) && !/[.!?]/.test(value)) ||
  /^(?:\d+(?:px|rem|em|vh|vw)|calc\(|url\(|M\d)/.test(value) ||
  /\.(?:csv|json|py|ts|tsx)$/.test(value) ||
  (/^(?:\S+\s+)+\S+$/.test(value) &&
    /(?:^|\s)(?:flex|grid|rounded(?:-\S+)?|p[trblxy]?-[^ ]+|m[trblxy]?-[^ ]+|gap-[^ ]+|cursor-[^ ]+|transition-[^ ]+|to-[^ ]+|from-[^ ]+|w-[^ ]+|h-[^ ]+|items-[^ ]+|justify-[^ ]+|overflow-[^ ]+|opacity-[^ ]+|ring-[^ ]+|shadow-[^ ]+|inset-[^ ]+|top-[^ ]+|bottom-[^ ]+|left-[^ ]+|right-[^ ]+|z-[^ ]+)/.test(
      value,
    ) &&
    !/[.!?]/.test(value)) ||
  /^\s*(?:pp|%|€|k€|M€)\s*$/.test(value)

const looksLikeCopy = (value) =>
  hasWords(value) &&
  !looksTechnical(value) &&
  !/^[A-Z0-9_-]+$/.test(value) &&
  (/[\s.!?&/]/.test(value) || /^[A-ZÀ-ÖØ-Þ]/u.test(value))

function reportExpressionStrings(context, node, inferCopy = false) {
  if (
    node.type === 'Literal' &&
    typeof node.value === 'string' &&
    looksLikeCopy(node.value)
  ) {
    context.report({ node, messageId: 'hardcoded' })
    return
  }
  if (
    node.type === 'TemplateLiteral' &&
    node.quasis.some((quasi) =>
      inferCopy ? looksLikeCopy(quasi.value.raw) : hasWords(quasi.value.raw),
    )
  ) {
    context.report({ node, messageId: 'hardcoded' })
    return
  }
  if (node.type === 'ConditionalExpression') {
    reportExpressionStrings(context, node.consequent, inferCopy)
    reportExpressionStrings(context, node.alternate, inferCopy)
  }
  if (
    node.type === 'LogicalExpression' ||
    (node.type === 'BinaryExpression' && node.operator === '+')
  ) {
    reportExpressionStrings(context, node.left, inferCopy)
    reportExpressionStrings(context, node.right, inferCopy)
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require user-facing JSX strings to come from the i18n catalog.',
    },
    messages: {
      hardcoded: 'Move this user-facing string to the i18n catalog.',
    },
    schema: [],
  },
  create(context) {
    const isFixtureData = /(?:\/mocks\/|\.mock\.[cm]?[jt]sx?$)/u.test(
      context.filename.replaceAll('\\', '/'),
    )
    const isComponentSource = context.filename.endsWith('.tsx')
    const isPresentationHelper = helperRole(context.filename) === 'presentation'
    const isTranslationKey = (node) =>
      node.parent.type === 'CallExpression' &&
      node.parent.arguments[0] === node &&
      node.parent.callee.type === 'MemberExpression' &&
      node.parent.callee.object.type === 'Identifier' &&
      node.parent.callee.object.name === 'i18n' &&
      node.parent.callee.property.type === 'Identifier' &&
      node.parent.callee.property.name === 't'
    const isInsideNamedCopyContainer = (node) => {
      let current = node.parent
      while (current) {
        if (current.type === 'VariableDeclarator') {
          return (
            current.id.type === 'Identifier' &&
            /(?:LABELS?|COPY|TITLES?|HEADERS?|MESSAGES?|NAMES?)$/.test(
              current.id.name,
            )
          )
        }
        if (current.type.endsWith('Statement') || current.type === 'Program')
          return false
        current = current.parent
      }
      return false
    }
    return {
      Literal(node) {
        if (isFixtureData) return
        if (
          typeof node.value !== 'string' ||
          !looksLikeCopy(node.value) ||
          isTranslationKey(node)
        )
          return
        if (isInsideNamedCopyContainer(node)) {
          context.report({ node, messageId: 'hardcoded' })
          return
        }
        if (!isPresentationHelper) return
        if (
          node.parent.type === 'VariableDeclarator' ||
          node.parent.type === 'Property' ||
          node.parent.type === 'ConditionalExpression' ||
          node.parent.type === 'AssignmentExpression'
        ) {
          context.report({ node, messageId: 'hardcoded' })
        }
      },
      JSXText(node) {
        if (hasWords(node.value)) {
          context.report({ node, messageId: 'hardcoded' })
        }
      },
      JSXAttribute(node) {
        if (
          node.name.name === 'name' &&
          node.parent.name.type === 'JSXIdentifier' &&
          /^[a-z]/.test(node.parent.name.name)
        )
          return
        if (
          !USER_FACING_ATTRIBUTES.has(node.name.name) &&
          !/(?:Description|Label|Message|Text|Title|Tooltip)$/.test(
            node.name.name,
          )
        )
          return

        if (
          node.value?.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          hasWords(node.value.value)
        ) {
          context.report({ node: node.value, messageId: 'hardcoded' })
        }

        const expression =
          node.value?.type === 'JSXExpressionContainer'
            ? node.value.expression
            : null
        if (
          expression?.type === 'Literal' &&
          typeof expression.value === 'string' &&
          hasWords(expression.value)
        ) {
          context.report({ node: expression, messageId: 'hardcoded' })
          return
        }
        if (expression) reportExpressionStrings(context, expression)
      },
      JSXExpressionContainer(node) {
        if (node.parent.type === 'JSXAttribute') return
        reportExpressionStrings(context, node.expression)
      },
      Property(node) {
        if (isFixtureData) return
        if (node.computed || node.key.type !== 'Identifier') return
        const isKnownCopy = USER_FACING_PROPERTIES.has(node.key.name)
        const isComponentCopy = isComponentSource
        if (
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          (isKnownCopy || isComponentCopy) &&
          looksLikeCopy(node.value.value) &&
          !looksTechnical(node.value.value)
        ) {
          context.report({ node: node.value, messageId: 'hardcoded' })
        }
        if (
          isKnownCopy &&
          node.value.type === 'TemplateLiteral' &&
          node.value.quasis.some((quasi) => hasWords(quasi.value.raw))
        ) {
          context.report({ node: node.value, messageId: 'hardcoded' })
        }
      },
      ConditionalExpression(node) {
        if (!isComponentSource) return
        reportExpressionStrings(context, node.consequent)
        reportExpressionStrings(context, node.alternate)
      },
      ArrayExpression(node) {
        if (!isComponentSource) return
        for (const element of node.elements) {
          if (
            element?.type === 'Literal' &&
            typeof element.value === 'string' &&
            looksLikeCopy(element.value)
          ) {
            context.report({ node: element, messageId: 'hardcoded' })
          }
        }
      },
      ReturnStatement(node) {
        if (!isPresentationHelper || !node.argument) return
        reportExpressionStrings(context, node.argument, true)
      },
    }
  },
}
