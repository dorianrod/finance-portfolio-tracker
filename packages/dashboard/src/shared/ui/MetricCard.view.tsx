import type { ReactNode } from 'react'

import { METRIC_CARD_ACCENTS } from './metricCardAppearance'

export type MetricCardAccent = keyof typeof METRIC_CARD_ACCENTS

export function MetricCard({
  accent,
  label,
  onOpen,
  children,
}: {
  accent: MetricCardAccent
  label: string
  onOpen: () => void
  children: ReactNode
}) {
  return (
    <article className="group relative min-w-0 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface/80">
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${METRIC_CARD_ACCENTS[accent]}`}
      />
      {children}
    </article>
  )
}

function MetricCardHeader({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
      <span>{children}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 20 20"
        fill="none"
        className="mt-0.5 h-4 w-4 shrink-0 text-content-subtle transition-all group-hover:translate-x-0.5 group-hover:text-content-muted"
      >
        <path
          d="M4 10h11m-4-4 4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function MetricCardAction({ children }: { children: ReactNode }) {
  return <span className="pointer-events-auto">{children}</span>
}

function MetricCardBody({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none relative z-10 mt-4 block">
      {children}
    </span>
  )
}

MetricCard.Header = MetricCardHeader
MetricCard.Action = MetricCardAction
MetricCard.Body = MetricCardBody
