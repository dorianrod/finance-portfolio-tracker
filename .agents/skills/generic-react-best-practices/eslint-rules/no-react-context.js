export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep project-owned shared state in Jotai, including compound UI',
    },
    schema: [],
    messages: {
      context:
        'Share client state through scoped Jotai atoms instead of an application React Context. [arch-no-prop-drilling]',
    },
  },
  create(context) {
    if (/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/u.test(context.filename))
      return {}
    function reactImport(identifier) {
      if (identifier.type !== 'Identifier') return null
      for (
        let scope = context.sourceCode.getScope(identifier);
        scope;
        scope = scope.upper
      ) {
        const variable = scope.set.get(identifier.name)
        if (!variable) continue
        const definition = variable.defs.find(
          (def) =>
            def.type === 'ImportBinding' && def.parent.source.value === 'react',
        )
        return definition?.node ?? null
      }
      return null
    }
    return {
      CallExpression(node) {
        const callee = node.callee
        const imported = reactImport(callee)
        const isCreator =
          imported?.type === 'ImportSpecifier' &&
          (imported.imported.name ?? imported.imported.value) ===
            'createContext'
        const namespace =
          callee.type === 'MemberExpression' ? reactImport(callee.object) : null
        const isMember =
          callee.type === 'MemberExpression' &&
          (namespace?.type === 'ImportNamespaceSpecifier' ||
            namespace?.type === 'ImportDefaultSpecifier') &&
          (callee.computed ? callee.property.value : callee.property.name) ===
            'createContext'
        if (isCreator || isMember)
          context.report({ node, messageId: 'context' })
      },
    }
  },
}
