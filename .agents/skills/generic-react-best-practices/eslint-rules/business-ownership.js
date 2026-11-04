const ROLE_FOLDERS = new Set([
  'apis',
  'components',
  'constants',
  'helpers',
  'mocks',
  'pages',
  'schemas',
  'services',
  'shared',
  'stores',
  'types',
])

export function businessScopes(path) {
  const parts = path.split('/')
  if (parts[0] !== 'domains' || parts.length < 3) return []
  const scopes = [parts.slice(0, 2).join('/')]
  let index = 2
  while (index < parts.length - 1) {
    if (parts[index] === 'features') {
      index += 2
    } else if (ROLE_FOLDERS.has(parts[index])) {
      break
    } else {
      index += 1
    }
    scopes.push(parts.slice(0, index).join('/'))
  }
  return scopes
}

export function businessBoundaryViolation(source, target) {
  const shared = sharedOwner(source)
  if (
    shared &&
    target.startsWith(`${shared}/`) &&
    !target.startsWith(`${shared}/shared/`)
  )
    return 'sharedScope'
  const from = businessScopes(source)
  const to = businessScopes(target)
  if (!from.length || !to.length) return null
  if (from[0] !== to[0]) return 'businessDomain'
  for (let index = 1; index < Math.min(from.length, to.length); index += 1) {
    if (from[index] !== to[index]) return 'siblingFeature'
  }
  if (to.length < from.length && !target.startsWith(`${to.at(-1)}/shared/`))
    return 'ancestorFeature'
  return null
}

export function sharedOwner(file) {
  if (!file.startsWith('domains/')) return null
  const owner = businessScopes(file).at(-1)
  return owner && file.startsWith(`${owner}/shared/`) ? owner : null
}

export function featureScopes(path) {
  return businessScopes(path).filter((scope) =>
    /\/features\/[^/]+$/u.test(scope),
  )
}
