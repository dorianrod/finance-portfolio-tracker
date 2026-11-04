export function getTabbableElements(container: ParentNode): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(isTabbable)
    .toSorted((left, right) => {
      if (left.tabIndex === right.tabIndex) return 0
      if (left.tabIndex === 0) return 1
      if (right.tabIndex === 0) return -1
      return left.tabIndex - right.tabIndex
    })
}

const FOCUSABLE =
  'a[href], area[href], button, input, select, textarea, [tabindex], [contenteditable="true"], summary'

function isTabbable(element: HTMLElement): boolean {
  if (
    element.tabIndex < 0 ||
    element.matches(':disabled, input[type="hidden"]') ||
    element.closest('[hidden], [inert], [aria-hidden="true"]')
  )
    return false
  const visibility = getComputedStyle(element).visibility
  if (visibility === 'hidden' || visibility === 'collapse') return false
  let ancestor: HTMLElement | null = element
  while (ancestor) {
    if (getComputedStyle(ancestor).display === 'none') return false
    ancestor = ancestor.parentElement
  }
  return true
}
