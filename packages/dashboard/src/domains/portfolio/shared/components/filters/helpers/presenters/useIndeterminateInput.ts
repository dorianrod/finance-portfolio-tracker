import { useEffect, useRef } from 'react'

export function useIndeterminateInput(indeterminate: boolean | undefined) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false
  }, [indeterminate])
  return ref
}
