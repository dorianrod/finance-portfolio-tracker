import ts from 'typescript'

// Inspect declared component APIs even when no caller supplies the forbidden prop.
// Exported compound slots are public APIs too; private dependency renderers may
// still receive optional properties declared by the external integration.
export function inspectComponentContracts(
  source,
  checker,
  inspect,
  publicOnly = false,
) {
  const inspected = new Set()

  function resolve(symbol) {
    return symbol?.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol
  }

  function component(location, type, isPublic) {
    if (!type || inspected.has(type)) return
    inspected.add(type)
    const properties = new Set()
    for (const signature of [
      ...type.getCallSignatures(),
      ...type.getConstructSignatures(),
    ]) {
      const parameter = signature.parameters[0]
      if (!parameter) continue
      const props = checker.getTypeOfSymbolAtLocation(parameter, location)
      const parts = props.isUnion() ? props.types : [props]
      for (const part of parts) {
        for (const property of part.getProperties()) {
          if (properties.has(property)) continue
          properties.add(property)
          inspect(property, location, isPublic)
        }
      }
    }
    if (!isPublic) return
    for (const property of type.getProperties()) {
      if (!/^[A-Z]/u.test(property.name)) continue
      const declaration =
        property.valueDeclaration ?? property.declarations?.[0]
      if (declaration?.getSourceFile() !== source) continue
      component(
        declaration,
        checker.getTypeOfSymbolAtLocation(property, declaration),
        true,
      )
    }
  }

  for (const exported of source.symbol
    ? checker.getExportsOfModule(source.symbol)
    : []) {
    if (exported.name !== 'default' && !/^[A-Z]/u.test(exported.name)) continue
    const symbol = resolve(exported)
    const declaration = symbol?.valueDeclaration
    if (declaration?.getSourceFile() !== source) continue
    component(
      declaration.name ?? declaration,
      checker.getTypeOfSymbolAtLocation(symbol, declaration),
      true,
    )
  }
  if (publicOnly) return

  function visit(node) {
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isVariableDeclaration(node) ||
        ts.isClassDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      /^[A-Z]/u.test(node.name.text)
    ) {
      const symbol = checker.getSymbolAtLocation(node.name)
      if (symbol)
        component(
          node.name,
          checker.getTypeOfSymbolAtLocation(symbol, node),
          false,
        )
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}
