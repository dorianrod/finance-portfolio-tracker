import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type {
  AccountScopeMode,
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/types/filterScope.type'
import i18n from '@/i18n/i18n'
import type { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export type ScopeBadge = {
  label: string
  detail: string
  tone: 'applied' | 'default' | 'ignored'
}

function friendlyDate(
  value: Date | null | undefined,
  formatDate: ReturnType<typeof useFormatDate>,
): string | null {
  if (!value) return null
  return formatDate(value, { style: 'dayMonthYear', timeZone: 'UTC' })
}

function accountBadge(
  mode: AccountScopeMode,
  filters: DashboardFilters,
  labels: Record<string, string>,
): ScopeBadge {
  if (mode === 'global') {
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.globalAccounts'),
      detail:
        filters.accounts.size > 0
          ? i18n.t(
              'ui.buildfilterscopebadgesTs.thisAnalysisIntentionallyRemainsGlobalAndDoesNotUse',
            )
          : i18n.t(
              'ui.buildfilterscopebadgesTs.thisAnalysisIsDefinedForTheWholePortfolioRather',
            ),
      tone: filters.accounts.size > 0 ? 'ignored' : 'default',
    }
  }
  if (filters.accounts.size === 0) {
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.allAccounts'),
      detail: i18n.t('ui.buildfilterscopebadgesTs.noAccountFilterIsActive'),
      tone: 'default',
    }
  }
  if (filters.accounts.size === 1) {
    const account = [...filters.accounts][0]
    return {
      label: labels[account] ?? account,
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.thisIndicatorUsesTheSelectedAccount',
      ),
      tone: 'applied',
    }
  }
  return {
    label: i18n.t('ui.buildfilterscopebadgesTs.value0Accounts', {
      value0: filters.accounts.size,
    }),
    detail: i18n.t(
      'ui.buildfilterscopebadgesTs.thisIndicatorUsesTheSelectedAccounts',
    ),
    tone: 'applied',
  }
}

function periodBadge(
  mode: PeriodScopeMode,
  filters: DashboardFilters,
  formatDate: ReturnType<typeof useFormatDate>,
  effectiveDate?: Date | null,
): ScopeBadge {
  const active = !!(filters.dateFrom || filters.dateTo)
  const end = friendlyDate(effectiveDate ?? filters.dateTo, formatDate)
  const range = formatPeriodRange(filters, formatDate)
  switch (mode) {
    case 'latest':
    case 'mixed':
      return freshnessPeriodBadge(mode, active)
    case 'comparison-range':
    case 'range-or-trailing-12m':
    case 'range':
    case 'year-range':
      return rangePeriodBadge(mode, active, range)
    case 'as-of':
      return snapshotPeriodBadge(filters, end)
    default:
      return fixedHorizonPeriodBadge(mode, filters, end)
  }
}
function formatPeriodRange(
  filters: DashboardFilters,
  formatDate: ReturnType<typeof useFormatDate>,
): string | null {
  let range: string | null = null
  if (filters.dateFrom && filters.dateTo) {
    range = `${friendlyDate(filters.dateFrom, formatDate)} – ${friendlyDate(filters.dateTo, formatDate)}`
  } else if (filters.dateFrom) {
    range = i18n.t('ui.buildfilterscopebadges.sinceDate', {
      date: friendlyDate(filters.dateFrom, formatDate),
    })
  } else if (filters.dateTo) {
    range = i18n.t('ui.buildfilterscopebadges.untilDate', {
      date: friendlyDate(filters.dateTo, formatDate),
    })
  }

  return range
}
function freshnessPeriodBadge(
  mode: 'latest' | 'mixed',
  active: boolean,
): ScopeBadge {
  if (mode === 'latest') {
    return {
      label: active
        ? i18n.t('ui.buildfilterscopebadgesTs.latestDataPeriodNotApplied')
        : i18n.t('ui.buildfilterscopebadgesTs.latestData'),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.thisIndicatorDescribesTheLatestDataQualityStateAnd',
      ),
      tone: active ? 'ignored' : 'default',
    }
  }
  {
    return {
      label: active
        ? i18n.t('ui.buildfilterscopebadgesTs.mixedDateScope')
        : i18n.t('ui.buildfilterscopebadgesTs.latestHistorical'),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.thisCombinedIndicatorContainsBothHistoricalAnomaliesAndLatest',
      ),
      tone: active ? 'ignored' : 'default',
    }
  }
}
function rangePeriodBadge(
  mode: 'comparison-range' | 'range-or-trailing-12m' | 'range' | 'year-range',
  active: boolean,
  range: string | null,
): ScopeBadge {
  if (mode === 'comparison-range') {
    return active
      ? {
          label: i18n.t('ui.buildfilterscopebadgesTs.selectedVsPreviousPeriod'),
          detail: i18n.t(
            'ui.buildfilterscopebadgesTs.comparesValue0WithTheImmediatelyPrecedingPeriodOfEqual',
            { value0: range },
          ),
          tone: 'applied',
        }
      : {
          label: i18n.t('ui.buildfilterscopebadgesTs.trailing12mVsPrevious'),
          detail: i18n.t(
            'ui.buildfilterscopebadgesTs.comparesTheLatestTwelveMonthsWithThePrecedingTwelve',
          ),
          tone: 'default',
        }
  }
  if (mode === 'range-or-trailing-12m') {
    return active
      ? {
          label: i18n.t('ui.buildfilterscopebadgesTs.selectedPeriod'),
          detail: i18n.t('ui.buildfilterscopebadgesTs.usesValue0', {
            value0: range,
          }),
          tone: 'applied',
        }
      : {
          label: i18n.t('ui.buildfilterscopebadgesTs.trailing12m'),
          detail: i18n.t(
            'ui.buildfilterscopebadgesTs.showsTheLatestTwelveMonthsByDefault',
          ),
          tone: 'default',
        }
  }
  if (mode === 'range') {
    return active
      ? {
          label: i18n.t('ui.buildfilterscopebadgesTs.selectedPeriod'),
          detail: i18n.t('ui.buildfilterscopebadgesTs.usesValue0', {
            value0: range,
          }),
          tone: 'applied',
        }
      : {
          label: i18n.t('ui.buildfilterscopebadgesTs.allDates'),
          detail: i18n.t('ui.buildfilterscopebadgesTs.usesAllAvailableHistory'),
          tone: 'default',
        }
  }
  {
    return active
      ? {
          label: i18n.t('ui.buildfilterscopebadgesTs.selectedYears'),
          detail: i18n.t(
            'ui.buildfilterscopebadgesTs.usesCalendarYearsIntersectingValue0',
            {
              value0: range,
            },
          ),
          tone: 'applied',
        }
      : {
          label: i18n.t('ui.buildfilterscopebadgesTs.allYears'),
          detail: i18n.t(
            'ui.buildfilterscopebadgesTs.usesAllAvailableCalendarYears',
          ),
          tone: 'default',
        }
  }
}
function snapshotPeriodBadge(
  filters: DashboardFilters,
  end: string | null,
): ScopeBadge {
  if (filters.dateTo)
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.asOfValue0', {
        value0: end,
      }),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.usesTheLatestSnapshotOnOrBeforeTheSelected',
      ),
      tone: 'applied',
    }
  if (filters.dateFrom)
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.latestSnapshotStartIgnored'),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.aPointInTimeValueNeedsAnEndDate',
      ),
      tone: 'ignored',
    }
  return {
    label: i18n.t('ui.buildfilterscopebadgesTs.latestSnapshotValue0', {
      value0: end ? ` · ${end}` : '',
    }),
    detail: i18n.t(
      'ui.buildfilterscopebadgesTs.usesTheLatestAvailablePortfolioSnapshot',
    ),
    tone: 'default',
  }
}
function fixedHorizonPeriodBadge(
  mode: 'trailing-12m' | 'trailing-3y' | 'since-tracking',
  filters: DashboardFilters,
  end: string | null,
): ScopeBadge {
  const horizonByMode = {
    'trailing-12m': i18n.t('ui.buildfilterscopebadges.trailing12m'),
    'trailing-3y': i18n.t('ui.buildfilterscopebadges.trailing3y'),
    'since-tracking': i18n.t('ui.buildfilterscopebadges.sinceTracking'),
  } as const
  const horizon = horizonByMode[mode]
  if (filters.dateTo) {
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.value0ToValue1', {
        value0: horizon,
        value1: end,
      }),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.theSelectedEndDateAnchorsThisFixedHorizonThe',
      ),
      tone: 'applied',
    }
  }
  if (filters.dateFrom) {
    return {
      label: i18n.t('ui.buildfilterscopebadgesTs.value0StartIgnored', {
        value0: horizon,
      }),
      detail: i18n.t(
        'ui.buildfilterscopebadgesTs.thisFixedHorizonIndicatorDoesNotUseAStart',
      ),
      tone: 'ignored',
    }
  }
  return {
    label: horizon,
    detail: i18n.t(
      'ui.buildfilterscopebadgesTs.usesTheValue0EndingAtTheLatestSnapshot',
      {
        value0: horizon.toLowerCase(),
      },
    ),
    tone: 'default',
  }
}

export function buildFilterScopeBadges({
  account,
  accountLabels,
  effectiveDate,
  filters,
  formatDate,
  period,
}: FilterScopeSpec & {
  accountLabels: Record<string, string>
  filters: DashboardFilters
  formatDate: ReturnType<typeof useFormatDate>
}): ScopeBadge[] {
  return [
    accountBadge(account, filters, accountLabels),
    periodBadge(period, filters, formatDate, effectiveDate),
  ]
}
