import { type PrimitiveAtom, useStore } from 'jotai'
import { createScope } from 'jotai-scope'
import { useMemo } from 'react'

export function useScopedInput<T>(inputAtom: PrimitiveAtom<T>, value: T) {
  const parentStore = useStore()
  return useMemo(() => {
    // Initialize a fresh scope: never mutate the store of a committed render.
    // Other atoms inherit the parent store, and changing inputs preserves DOM state.
    const scope = createScope({ parentStore, atoms: [inputAtom] })
    scope.set(inputAtom, value)
    return scope
  }, [inputAtom, parentStore, value])
}
