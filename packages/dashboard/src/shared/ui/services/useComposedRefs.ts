import { type Ref, useCallback } from 'react'

export function useComposedRefs<T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
) {
  return useCallback(
    (node: T | null) => {
      const clearFirst = assignRef(first, node)
      const clearSecond = assignRef(second, node)
      return () => {
        clearFirst?.()
        clearSecond?.()
      }
    },
    [first, second],
  )
}

function assignRef<T>(
  ref: Ref<T> | undefined,
  node: T | null,
): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(node)
    return typeof cleanup === 'function' ? cleanup : () => ref(null)
  }
  if (ref) {
    ref.current = node
    return () => {
      ref.current = null
    }
  }
}
