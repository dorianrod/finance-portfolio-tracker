import {
  isDomNode,
  isTestFile,
  memberName,
  testingLibraryBinding,
} from './test-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Use semantic Testing Library queries and userEvent in UI tests',
    },
    schema: [],
    messages: {
      query:
        'Query controls by role/name and static content by text instead of test IDs or DOM selectors. [test-semantic-queries]',
      event:
        'Interact through userEvent.setup() instead of fireEvent. [test-semantic-queries]',
      tag: 'Assert native semantics by role instead of checking DOM tagName. [test-semantic-queries]',
    },
  },
  create(context) {
    if (!isTestFile(context.filename)) return {}
    const source = context.sourceCode
    return {
      CallExpression(node) {
        const binding = testingLibraryBinding(source, node.callee)
        if (/^(?:get|query|find)(?:All)?ByTestId$/u.test(binding ?? ''))
          context.report({ node, messageId: 'query' })
        else if (
          binding === 'fireEvent' ||
          testingLibraryBinding(source, node.callee.object) === 'fireEvent'
        )
          context.report({ node, messageId: 'event' })
        else if (
          [
            'querySelector',
            'querySelectorAll',
            'getElementsByTagName',
            'getElementsByClassName',
            'getElementById',
            'closest',
          ].includes(memberName(node.callee)) &&
          isDomNode(context, node.callee.object)
        )
          context.report({ node, messageId: 'query' })
      },
      MemberExpression(node) {
        if (memberName(node) === 'tagName' && isDomNode(context, node.object))
          context.report({ node, messageId: 'tag' })
      },
    }
  },
}
