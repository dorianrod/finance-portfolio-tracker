import { isExpectCall, isTestFile, memberName } from './test-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep test assertions unconditional and outside collection iteration',
    },
    schema: [],
    messages: {
      conditional:
        'Use test.each or assert the complete result outside branches and iteration. [test-behavior-not-implementation]',
    },
  },
  create(context) {
    if (!isTestFile(context.filename)) return {}
    return {
      CallExpression(node) {
        if (!isExpectCall(context.sourceCode, node)) return
        for (
          let child = node, parent = node.parent;
          parent;
          child = parent, parent = parent.parent
        ) {
          if (
            [
              'IfStatement',
              'SwitchCase',
              'ForStatement',
              'ForInStatement',
              'ForOfStatement',
              'WhileStatement',
              'DoWhileStatement',
              'CatchClause',
            ].includes(parent.type) ||
            (parent.type === 'ConditionalExpression' &&
              child !== parent.test) ||
            (parent.type === 'LogicalExpression' && child === parent.right) ||
            (parent.type === 'CallExpression' &&
              parent.arguments.includes(child) &&
              [
                'forEach',
                'map',
                'flatMap',
                'filter',
                'reduce',
                'reduceRight',
                'some',
                'every',
              ].includes(memberName(parent.callee)))
          ) {
            context.report({ node, messageId: 'conditional' })
            break
          }
        }
      },
    }
  },
}
