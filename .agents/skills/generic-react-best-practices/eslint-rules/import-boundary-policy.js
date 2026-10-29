import { businessBoundaryViolation } from './business-ownership.js'

const NON_UI_LAYER =
  /\/(?:apis|constants|helpers|schemas|services|stores|types)\//u
const COMPONENT_MODULE = /\.(?:feature|state|view)\.[cm]?[jt]sx?$/u
function componentOwner(path) {
  const match =
    /^(.*\/(?:components|pages)\/.*?)\/(?:helpers|services|stores|types)\//u.exec(
      path,
    )
  return match?.[1]
}

function isWithin(path, directory) {
  return path === directory || path.startsWith(`${directory}/`)
}

export function importBoundaryViolation(source, target) {
  if (
    target.startsWith('shared/ui/storybook/') &&
    !source.startsWith('shared/ui/storybook/')
  )
    return 'storybook'
  if (
    source.startsWith('shared/') &&
    (target.startsWith('app/') || target.startsWith('domains/'))
  )
    return 'shared'
  if (source.startsWith('domains/') && target.startsWith('app/'))
    return 'application'
  const business = businessBoundaryViolation(source, target)
  if (business) return business
  const nonUiSource =
    NON_UI_LAYER.test(`/${source}`) && !COMPONENT_MODULE.test(source)
  if (nonUiSource && COMPONENT_MODULE.test(target)) return 'component'
  if (nonUiSource) {
    const targetOwner = componentOwner(`/${target}`)
    if (targetOwner && !isWithin(`/${source}`, targetOwner))
      return 'componentLogic'
  }
  return null
}
