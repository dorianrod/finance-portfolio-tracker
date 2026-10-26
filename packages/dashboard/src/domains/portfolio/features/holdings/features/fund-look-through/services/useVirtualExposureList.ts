import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { ExposureRow } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'

export function useVirtualExposureList(rows: ExposureRow[]) {
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (listRef.current)
        setScrollMargin(
          listRef.current.getBoundingClientRect().top + window.scrollY,
        )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    scrollMargin,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const virtualRows = useMemo(
    () =>
      virtualItems.map((item) => {
        const row = rows[item.index]
        return { item, key: rowKey(row), row }
      }),
    [rows, virtualItems],
  )

  return useMemo(
    () => ({ listRef, scrollMargin, virtualizer, virtualRows }),
    [listRef, scrollMargin, virtualizer, virtualRows],
  )
}

const ROW_HEIGHT = 40

function rowKey(row: ExposureRow): string {
  if (row.kind === 'issuer') return row.issuer.id
  if (row.kind === 'security') return `${row.issuer.id}|${row.security.id}`
  return `${row.issuer.id}|${row.security.id}|${row.fund}`
}
