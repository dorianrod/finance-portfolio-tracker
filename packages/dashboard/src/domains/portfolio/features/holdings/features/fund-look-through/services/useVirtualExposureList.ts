import { useLayoutEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { ExposureRow } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'

const ROW_HEIGHT = 40

function rowKey(row: ExposureRow): string {
  if (row.kind === 'issuer') return row.issuer.id
  if (row.kind === 'security') return `${row.issuer.id}|${row.security.id}`
  return `${row.issuer.id}|${row.security.id}|${row.fund}`
}

export function useVirtualExposureList(rows: ExposureRow[]) {
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (listRef.current) setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY)
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
  const virtualRows = virtualizer.getVirtualItems().map((item) => {
    const row = rows[item.index]
    return { item, key: rowKey(row), row }
  })

  return { listRef, scrollMargin, virtualizer, virtualRows }
}
