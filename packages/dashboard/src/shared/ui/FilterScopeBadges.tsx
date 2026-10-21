import { createContext, useContext, type ReactNode } from 'react'
import type { Filters } from '@/types/filters'

export type AccountScopeMode = 'filterable' | 'global'
export type PeriodScopeMode =
  | 'range'
  | 'comparison-range'
  | 'range-or-trailing-12m'
  | 'as-of'
  | 'trailing-12m'
  | 'trailing-3y'
  | 'since-tracking'
  | 'year-range'
  | 'latest'
  | 'mixed'

export interface FilterScopeSpec {
  account: AccountScopeMode
  period: PeriodScopeMode
  effectiveDate?: string | null
}

interface FilterScopeContextValue {
  filters: Filters
  accountLabels: Record<string, string>
}

const FilterScopeContext = createContext<FilterScopeContextValue | null>(null)

export function FilterScopeProvider({
  filters,
  accountLabels,
  children,
}: FilterScopeContextValue & { children: ReactNode }) {
  return (
    <FilterScopeContext.Provider value={{ filters, accountLabels }}>
      {children}
    </FilterScopeContext.Provider>
  )
}

function friendlyDate(value: string | null | undefined): string | null {
  if (!value) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`))
}

function accountBadge(
  mode: AccountScopeMode,
  filters: Filters,
  labels: Record<string, string>,
): { label: string; detail: string; tone: 'applied' | 'default' | 'ignored' } {
  if (mode === 'global') {
    return {
      label: 'Global accounts',
      detail: filters.accounts.size > 0
        ? 'This analysis intentionally remains global and does not use the selected-account filter.'
        : 'This analysis is defined for the whole portfolio rather than individual accounts.',
      tone: filters.accounts.size > 0 ? 'ignored' : 'default',
    }
  }
  if (filters.accounts.size === 0) {
    return { label: 'All accounts', detail: 'No account filter is active.', tone: 'default' }
  }
  if (filters.accounts.size === 1) {
    const account = [...filters.accounts][0]
    return {
      label: labels[account] ?? account,
      detail: 'This indicator uses the selected account.',
      tone: 'applied',
    }
  }
  return {
    label: `${filters.accounts.size} accounts`,
    detail: 'This indicator uses the selected accounts.',
    tone: 'applied',
  }
}

function periodBadge(
  mode: PeriodScopeMode,
  filters: Filters,
  effectiveDate?: string | null,
): { label: string; detail: string; tone: 'applied' | 'default' | 'ignored' } {
  const active = !!(filters.dateFrom || filters.dateTo)
  const end = friendlyDate(effectiveDate ?? filters.dateTo)
  const range = filters.dateFrom && filters.dateTo
    ? `${friendlyDate(filters.dateFrom)} – ${friendlyDate(filters.dateTo)}`
    : filters.dateFrom
      ? `Since ${friendlyDate(filters.dateFrom)}`
      : filters.dateTo
        ? `Until ${friendlyDate(filters.dateTo)}`
        : null

  if (mode === 'latest') {
    return {
      label: active ? 'Latest data · period not applied' : 'Latest data',
      detail: 'This indicator describes the latest data-quality state and is not historical.',
      tone: active ? 'ignored' : 'default',
    }
  }
  if (mode === 'mixed') {
    return {
      label: active ? 'Mixed date scope' : 'Latest + historical',
      detail: 'This combined indicator contains both historical anomalies and latest-state quality metrics; inspect its sub-metrics for their exact scope.',
      tone: active ? 'ignored' : 'default',
    }
  }
  if (mode === 'comparison-range') {
    return active
      ? { label: 'Selected vs previous period', detail: `Compares ${range} with the immediately preceding period of equal length.`, tone: 'applied' }
      : { label: 'Trailing 12m vs previous', detail: 'Compares the latest twelve months with the preceding twelve-month window.', tone: 'default' }
  }
  if (mode === 'range-or-trailing-12m') {
    return active
      ? { label: 'Selected period', detail: `Uses ${range}.`, tone: 'applied' }
      : { label: 'Trailing 12m', detail: 'Shows the latest twelve months by default.', tone: 'default' }
  }
  if (mode === 'range') {
    return active
      ? { label: 'Selected period', detail: `Uses ${range}.`, tone: 'applied' }
      : { label: 'All dates', detail: 'Uses all available history.', tone: 'default' }
  }
  if (mode === 'year-range') {
    return active
      ? { label: 'Selected years', detail: `Uses calendar years intersecting ${range}.`, tone: 'applied' }
      : { label: 'All years', detail: 'Uses all available calendar years.', tone: 'default' }
  }
  if (mode === 'as-of') {
    if (filters.dateTo) return { label: `As of ${end}`, detail: 'Uses the latest snapshot on or before the selected end date.', tone: 'applied' }
    if (filters.dateFrom) return { label: 'Latest snapshot · start ignored', detail: 'A point-in-time value needs an end date; the selected start date is not applicable.', tone: 'ignored' }
    return { label: `Latest snapshot${end ? ` · ${end}` : ''}`, detail: 'Uses the latest available portfolio snapshot.', tone: 'default' }
  }

  const horizon = mode === 'trailing-12m'
    ? 'Trailing 12m'
    : mode === 'trailing-3y'
      ? 'Trailing 3y'
      : 'Since tracking'
  if (filters.dateTo) {
    return {
      label: `${horizon} to ${end}`,
      detail: 'The selected end date anchors this fixed horizon; the selected start date does not redefine it.',
      tone: 'applied',
    }
  }
  if (filters.dateFrom) {
    return {
      label: `${horizon} · start ignored`,
      detail: 'This fixed-horizon indicator does not use a start-only date filter.',
      tone: 'ignored',
    }
  }
  return { label: horizon, detail: `Uses the ${horizon.toLowerCase()} ending at the latest snapshot.`, tone: 'default' }
}

const TONE_CLASSES = {
  applied: 'border-blue-700/70 bg-blue-900/60 text-blue-300',
  default: 'border-gray-700 bg-gray-950/45 text-gray-500',
  ignored: 'border-amber-700/60 bg-amber-950/35 text-amber-300',
} as const

export function FilterScopeBadges({ account, period, effectiveDate }: FilterScopeSpec) {
  const context = useContext(FilterScopeContext)
  if (!context) return null
  const badges = [
    accountBadge(account, context.filters, context.accountLabels),
    periodBadge(period, context.filters, effectiveDate),
  ]
  return (
    <span className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Indicator filter scope">
      {badges.map((badge) => (
        <span
          key={badge.label}
          title={badge.detail}
          className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal ${TONE_CLASSES[badge.tone]}`}
        >
          {badge.label}
        </span>
      ))}
    </span>
  )
}
