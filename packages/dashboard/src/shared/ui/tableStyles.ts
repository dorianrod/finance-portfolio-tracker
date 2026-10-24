export const DATA_TABLE_STYLES = {
  panel: 'rounded-xl border border-border bg-surface',
  toolbar:
    'flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center',
  title: 'text-base font-semibold text-content',
  description: 'mt-1 text-xs text-content-subtle',
  actions: 'ml-auto flex w-full gap-2 sm:w-auto',
  columnHeader:
    'sticky top-0 z-10 border-b border-border-strong bg-surface-raised text-xs font-semibold lowercase text-content-muted',
} as const
