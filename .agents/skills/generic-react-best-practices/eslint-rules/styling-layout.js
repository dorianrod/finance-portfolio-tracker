const LAYOUT_PROPERTIES = new Set([
  'display',
  'position',
  'inset',
  'inset-block',
  'inset-block-start',
  'inset-block-end',
  'inset-inline',
  'inset-inline-start',
  'inset-inline-end',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'box-sizing',
  'float',
  'clear',
  'isolation',
  'columns',
  'column-count',
  'column-width',
  'column-gap',
  'row-gap',
  'gap',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'order',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'align-content',
  'align-items',
  'align-self',
  'justify-content',
  'justify-items',
  'justify-self',
  'place-content',
  'place-items',
  'place-self',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'inline-size',
  'min-inline-size',
  'max-inline-size',
  'block-size',
  'min-block-size',
  'max-block-size',
  'aspect-ratio',
  'overflow',
  'overflow-x',
  'overflow-y',
  'overflow-block',
  'overflow-inline',
  'table-layout',
])

for (const property of ['margin', 'padding']) {
  LAYOUT_PROPERTIES.add(property)
  for (const side of [
    'top',
    'right',
    'bottom',
    'left',
    'block',
    'block-start',
    'block-end',
    'inline',
    'inline-start',
    'inline-end',
  ])
    LAYOUT_PROPERTIES.add(`${property}-${side}`)
}

const LAYOUT_CLASSES = new Set([
  'block',
  'inline-block',
  'inline',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'flow-root',
  'contents',
  'hidden',
  'list-item',
  'table',
  'inline-table',
  'table-caption',
  'table-cell',
  'table-column',
  'table-column-group',
  'table-footer-group',
  'table-header-group',
  'table-row-group',
  'table-row',
  'table-auto',
  'table-fixed',
  'static',
  'fixed',
  'absolute',
  'relative',
  'sticky',
  'isolate',
  'isolation-auto',
  'box-border',
  'box-content',
  'grow',
  'shrink',
  'flex-row',
  'flex-row-reverse',
  'flex-col',
  'flex-col-reverse',
  'flex-wrap',
  'flex-wrap-reverse',
  'flex-nowrap',
  'grid-flow-row',
  'grid-flow-col',
  'grid-flow-dense',
  'grid-flow-row-dense',
  'grid-flow-col-dense',
])

// These prefixes only set layout properties. In particular, content-* is not a
// family: content-['text'] generates content, whereas content-center aligns rows.
const LAYOUT_FAMILY =
  /^(?:inset(?:-[xyse])?|top|right|bottom|left|start|end|z|order|basis|grow|shrink|flex|grid-cols|grid-rows|auto-cols|auto-rows|col(?:-span|-start|-end)?|row(?:-span|-start|-end)?|gap(?:-[xy])?|space-[xy]|m[trblxyse]?|p[trblxyse]?|w|min-w|max-w|h|min-h|max-h|size|aspect|columns|inline-size|min-inline-size|max-inline-size|block-size|min-block-size|max-block-size)-(.+)$/u
const ALIGNMENT =
  /^(?:items|justify|content|self|justify-items|justify-self|place-items|place-content|place-self)-(?:normal|start|end|center|between|around|evenly|baseline|baseline-last|stretch|auto|start-safe|end-safe|center-safe)$/u
const OVERFLOW = /^overflow(?:-[xy])?-(?:auto|hidden|clip|visible|scroll)$/u
const FLOAT_CLEAR = /^(?:float|clear)-(?:left|right|start|end|none|both)$/u

export function isLayoutProperty(name) {
  const normalized = name.replace(
    /[A-Z]/gu,
    (letter) => `-${letter.toLowerCase()}`,
  )
  return LAYOUT_PROPERTIES.has(normalized)
}

// Split only outside arbitrary values/selectors, quoted strings and escapes.
export function splitOutside(value, delimiter) {
  const parts = []
  const stack = []
  let quote = ''
  let start = 0
  let escaped = false
  for (let index = 0; index < value.length; index++) {
    const character = value[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) quote = ''
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === '[' || character === '(') stack.push(character)
    else if (character === ']' || character === ')') {
      if (stack.pop() !== (character === ']' ? '[' : '(')) return null
    } else if (!stack.length && delimiter.test(character)) {
      parts.push(value.slice(start, index))
      start = index + 1
    }
  }
  if (stack.length || quote || escaped) return null
  parts.push(value.slice(start))
  return parts
}

export function isLayoutClass(token) {
  const variants = splitOutside(token, /:/u)
  if (!variants) return false
  let utility = variants.at(-1).replace(/^!|!$/gu, '')
  if (utility.startsWith('-')) utility = utility.slice(1)
  if (utility.startsWith('[') && utility.endsWith(']')) {
    const property = splitOutside(utility.slice(1, -1), /:/u)
    return (
      property?.length === 2 &&
      isLayoutProperty(property[0]) &&
      !property[1].includes(';')
    )
  }
  if (
    LAYOUT_CLASSES.has(utility) ||
    ALIGNMENT.test(utility) ||
    OVERFLOW.test(utility) ||
    FLOAT_CLEAR.test(utility)
  )
    return true
  const family = LAYOUT_FAMILY.exec(utility)
  return Boolean(family && !family[1].includes(';'))
}
