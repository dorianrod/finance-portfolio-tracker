import { childrenOf, findVariable } from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'
import { splitOutside } from './styling-layout.js'
import {
  assertionOf,
  isDomNode,
  isTestFile,
  memberName,
  possibleTestTexts,
  resolveTestValue,
  staticTestText,
} from './test-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Assert observable behavior instead of CSS classes in tests',
    },
    schema: [],
    messages: {
      style:
        'Assert behavior or accessible state instead of CSS classes or serialized Tailwind utilities. [test-behavior-not-implementation]',
    },
  },
  create(context) {
    if (!isTestFile(context.filename)) return {}
    const source = context.sourceCode
    function serialized(input) {
      const node = resolveTestValue(source, input)
      if (node?.type === 'CallExpression')
        return ['renderToStaticMarkup', 'renderToString'].includes(
          libraryBinding(source, node.callee, 'react-dom/server'),
        )
      return (
        node?.type === 'MemberExpression' &&
        ['innerHTML', 'outerHTML'].includes(memberName(node)) &&
        isDomNode(context, node.object)
      )
    }
    function classRead(input, seen = new Set()) {
      const node = resolveTestValue(source, input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (node.type === 'Identifier') {
        const definition = findVariable(source, node)?.defs[0]
        if (
          definition?.type === 'Variable' &&
          definition.node.id.type === 'ObjectPattern' &&
          isDomNode(context, definition.node.init) &&
          definition.node.id.properties.some(
            (property) =>
              property.value?.name === node.name &&
              ['className', 'classList'].includes(
                property.key?.name ?? property.key?.value,
              ),
          )
        )
          return true
      }
      if (
        node.type === 'MemberExpression' &&
        ['className', 'classList'].includes(memberName(node)) &&
        isDomNode(context, node.object)
      )
        return true
      if (
        node.type === 'CallExpression' &&
        memberName(node.callee) === 'getAttribute' &&
        staticTestText(source, node.arguments[0]) === 'class' &&
        isDomNode(context, node.callee.object)
      )
        return true
      return childrenOf(source, node).some((child) => classRead(child, seen))
    }
    function styleText(input) {
      return possibleTestTexts(source, input).some(
        (value) =>
          /\bclass(?:Name)?\s*=/u.test(value) ||
          (value.trim().length > 0 &&
            value
              .replaceAll('\\b', ' ')
              .trim()
              .split(/\s+/u)
              .every((token) => {
                const utility = splitOutside(token, /:/u)
                  ?.at(-1)
                  ?.replace(/^!|!$/gu, '')
                return /^(?:-?(?:p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|space-[xy]|w|h|min-w|max-w|min-h|max-h|size)|bg|text|border|rounded|shadow|font|opacity|cursor|ring|flex|grid-cols|items|justify|overflow|transition|animate)-(?:[\w./%-]+|\[.+\])$/u.test(
                  utility ?? '',
                )
              })),
      )
    }
    function serializedCheck(input, seen = new Set()) {
      const node = resolveTestValue(source, input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'CallExpression' &&
        ['includes', 'indexOf', 'match', 'search'].includes(
          memberName(node.callee),
        ) &&
        serialized(node.callee.object) &&
        styleText(node.arguments[0])
      )
        return true
      return childrenOf(source, node).some((child) =>
        serializedCheck(child, seen),
      )
    }
    return {
      CallExpression(node) {
        const assertion = assertionOf(source, node)
        if (!assertion) return
        if (
          assertion.matcher === 'toHaveClass' ||
          (assertion.matcher === 'toHaveAttribute' &&
            ['class', 'className'].includes(
              staticTestText(source, assertion.expected[0]),
            )) ||
          classRead(assertion.actual) ||
          (serialized(assertion.actual) &&
            assertion.expected.some(styleText)) ||
          serializedCheck(assertion.actual)
        )
          context.report({ node, messageId: 'style' })
      },
    }
  },
}
