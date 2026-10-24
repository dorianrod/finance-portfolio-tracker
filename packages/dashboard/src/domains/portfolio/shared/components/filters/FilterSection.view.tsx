import type { ReactNode } from 'react'

export function FilterSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-border px-4 py-5 last:border-b-0">
      <h3 className="text-sm font-semibold text-content-secondary">{title}</h3>
      {description && (
        <p className="mt-1 text-xs leading-5 text-content-subtle">
          {description}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  )
}
