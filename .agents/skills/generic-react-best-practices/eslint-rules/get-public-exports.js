// Resolve local bindings so unmarked exports of local TS types stay type-only.
export function getPublicExports(program, sourceCode) {
  const scope = sourceCode.scopeManager.scopes.find(
    (candidate) => candidate.type === 'module' && candidate.block === program,
  )

  function binding(name) {
    return scope?.set.get(name)
  }

  function isTypeOnly(name) {
    const variable = binding(name)
    if (!variable) return false
    if (!variable.isValueVariable) return true
    return variable.defs.every(
      (definition) =>
        definition.type === 'ImportBinding' &&
        (definition.node.importKind === 'type' ||
          definition.parent.importKind === 'type'),
    )
  }

  function entry(node, name, local, fallback) {
    return {
      node,
      name,
      declarations:
        binding(local)?.defs.map(({ node }) => node) ??
        (fallback ? [fallback] : []),
    }
  }

  const exports = []
  for (const node of program.body) {
    if (node.exportKind === 'type') continue
    if (node.type === 'ExportAllDeclaration') {
      exports.push({
        node,
        name: node.exported?.name ?? node.exported?.value ?? '*',
        wildcard: !node.exported,
        declarations: [],
      })
    } else if (node.type === 'ExportDefaultDeclaration') {
      const declaration = node.declaration
      const local =
        declaration.type === 'Identifier'
          ? declaration.name
          : declaration.id?.name
      if (!isTypeOnly(local)) {
        exports.push(entry(node, 'default', local, declaration))
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      const declaration = node.declaration
      if (declaration?.type === 'VariableDeclaration') {
        for (const variable of sourceCode.getDeclaredVariables(declaration)) {
          exports.push(entry(node, variable.name, variable.name))
        }
      } else if (
        declaration &&
        !['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'].includes(
          declaration.type,
        )
      ) {
        exports.push(
          entry(node, declaration.id?.name, declaration.id?.name, declaration),
        )
      }
      for (const specifier of node.specifiers) {
        if (specifier.exportKind === 'type') continue
        if (!node.source && isTypeOnly(specifier.local.name)) continue
        exports.push(
          entry(
            node,
            specifier.exported.name ?? specifier.exported.value,
            node.source ? undefined : specifier.local.name,
          ),
        )
      }
    }
  }
  const names = new Set()
  return exports.filter((entry) => {
    if (entry.wildcard) return true
    if (names.has(entry.name)) return false
    names.add(entry.name)
    return true
  })
}
