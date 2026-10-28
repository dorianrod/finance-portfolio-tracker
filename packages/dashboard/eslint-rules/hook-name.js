import { importedBinding, stableInitializer, unwrap } from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'
import { getCalleeName } from './react-component-utils.js'

export function getHookName(sourceCode, input, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  const reactName = libraryBinding(sourceCode, node, 'react')
  if (reactName === 'use' || /^use[A-Z0-9]/u.test(reactName ?? ''))
    return reactName
  const imported = importedBinding(sourceCode, node)?.name
  if (/^use[A-Z0-9]/u.test(imported ?? '')) return imported
  const name = getCalleeName(node)
  if (/^use[A-Z0-9]/u.test(name ?? '')) return name
  return getHookName(sourceCode, stableInitializer(sourceCode, node), seen)
}
