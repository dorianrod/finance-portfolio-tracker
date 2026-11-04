import { businessScopes } from './business-ownership.js'

export const HELPER_CATEGORIES = Object.freeze({
  transformers: 'data',
  formatters: 'presentation',
  presenters: 'presentation',
})

// Resolve ownership before role folders, including scopes named "helpers".
export function moduleRoles(path) {
  const normalized = path.replaceAll('\\', '/')
  const relative = normalized.startsWith('@/')
    ? normalized.slice(2)
    : (normalized.match(/(?:^|\/)src\/(.+)$/u)?.[1] ??
      normalized.replace(/^\.\//u, ''))
  const owner = businessScopes(relative).at(-1)
  return owner ? relative.slice(owner.length + 1) : relative
}

export function helperCategories(path) {
  const roles = moduleRoles(path)
  if (/(?:^|\/)mocks\//u.test(roles)) return []
  return [...roles.matchAll(/(?:^|\/)helpers\//gu)].map((marker) => {
    const segments = roles.slice(marker.index + marker[0].length).split('/')
    return segments.length > 1 ? segments[0] : '(flat helpers folder)'
  })
}

export function helperCategory(path) {
  return helperCategories(path)[0] ?? null
}

export function helperRole(path) {
  const category = helperCategory(path)
  return Object.hasOwn(HELPER_CATEGORIES, category)
    ? HELPER_CATEGORIES[category]
    : null
}
