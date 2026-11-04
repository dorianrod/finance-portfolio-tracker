import type { ReactNode } from 'react'

export function Skeleton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  )
}

function SkeletonBlock({
  variant = 'text',
}: {
  variant?: keyof typeof BLOCK_VARIANTS
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-surface-hover/60 motion-safe:animate-pulse ${BLOCK_VARIANTS[variant]}`}
    />
  )
}

const BLOCK_VARIANTS = {
  text: 'h-3 w-full',
  label: 'h-3 w-28 max-w-full',
  title: 'h-5 w-48 max-w-full',
  value: 'h-8 w-36 max-w-full',
  control: 'h-9 w-32 max-w-full rounded-lg',
  plot: 'h-72 w-full rounded-lg',
  donut:
    'border-[2.5rem] border-surface-hover/60 size-56 max-w-full rounded-full bg-transparent',
} as const

function SkeletonMetric({ variant = 'card' }: { variant?: 'card' | 'inline' }) {
  return (
    <div className={METRIC_VARIANTS[variant]}>
      <SkeletonBlock variant="label" />
      <div className="mt-5 space-y-3">
        <SkeletonBlock variant="value" />
        <SkeletonBlock variant="label" />
      </div>
      <div className="mt-5">
        <SkeletonBlock />
      </div>
    </div>
  )
}

const METRIC_VARIANTS = {
  card: 'min-w-0 min-h-64 rounded-2xl border border-border bg-surface p-4',
  inline: 'min-w-0 flex-1 py-3',
} as const

function SkeletonChart({
  variant = 'cartesian',
}: {
  variant?: 'cartesian' | 'donut'
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4">
      <SkeletonBlock variant="title" />
      <div className="mt-3 mb-4">
        <SkeletonBlock variant="label" />
      </div>
      <div className="flex h-72 items-center justify-center">
        <SkeletonBlock variant={variant === 'donut' ? 'donut' : 'plot'} />
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <SkeletonBlock variant="label" />
        <SkeletonBlock variant="label" />
      </div>
    </div>
  )
}

function SkeletonTable({ columns = 6 }: { columns?: 4 | 6 | 10 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="space-y-3">
          <SkeletonBlock variant="title" />
          <SkeletonBlock variant="label" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock variant="control" />
          <SkeletonBlock variant="control" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className={TABLE_WIDTHS[columns]}>
          <SkeletonTableRow columns={columns} header />
          {ROWS.map((row) => (
            <SkeletonTableRow key={row} columns={columns} />
          ))}
        </div>
      </div>
    </div>
  )
}

const ROWS = [0, 1, 2, 3, 4, 5, 6, 7]
const TABLE_WIDTHS = {
  4: 'min-w-[600px]',
  6: 'min-w-[800px]',
  10: 'min-w-[1100px]',
} as const

function SkeletonTableRow({
  columns,
  header = false,
}: {
  columns: 4 | 6 | 10
  header?: boolean
}) {
  return (
    <div
      className={`grid items-center gap-6 border-t border-border px-4 ${header ? 'bg-surface-raised/50 py-3' : 'py-4'}`}
      style={{
        gridTemplateColumns: `minmax(12rem, 2fr) repeat(${columns - 1}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: columns }, (_, column) => (
        <SkeletonBlock key={column} />
      ))}
    </div>
  )
}

Skeleton.Block = SkeletonBlock
Skeleton.Metric = SkeletonMetric
Skeleton.Chart = SkeletonChart
Skeleton.Table = SkeletonTable
Skeleton.List = SkeletonList

function SkeletonList() {
  return (
    <div className="min-w-0 space-y-4">
      <SkeletonBlock variant="title" />
      {ROWS.slice(0, 5).map((row) => (
        <SkeletonListRow key={row} />
      ))}
    </div>
  )
}

function SkeletonListRow() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3">
      <SkeletonBlock variant="label" />
      <SkeletonBlock variant="label" />
    </div>
  )
}
