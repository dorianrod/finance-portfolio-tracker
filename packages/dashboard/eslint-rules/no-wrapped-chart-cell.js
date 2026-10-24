import { getFunctionComponentName, isFunctionNode } from './react-component-utils.js'

export default {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      directCell:
        'Render Recharts Cell directly inside Pie, Bar or Scatter. A component wrapper hides its props from the chart.',
    },
  },
  create(context) {
    const cells = new Set()
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'recharts') return
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Cell') {
            cells.add(specifier.local.name)
          }
        }
      },
      JSXElement(node) {
        if (!cells.has(node.openingElement.name.name)) return
        let parent = node.parent
        // A Cell in a map is a direct React element, whereas one returned by a component is opaque.
        while (parent && !isFunctionNode(parent)) parent = parent.parent
        if (getFunctionComponentName(parent)) {
          const directParent = node.parent
          if (directParent?.type === 'ReturnStatement' || directParent === parent) {
            context.report({ node, messageId: 'directCell' })
          }
        }
      },
    }
  },
}
